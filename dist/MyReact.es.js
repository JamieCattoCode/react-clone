const TEXT_ELEMENT = 'TEXT';

function createTextElement(nodeValue) {
    return createElement(TEXT_ELEMENT, { nodeValue, children: [] });
}

function createElement(type, configObject, ...args) {
    // Create a shallow copy of configObject to props
    const props = Object.assign({}, configObject);
    // Check if there are additional arguments and define hasChildren as boolean
    const hasChildren = args.length > 0;
    // If there are children passed, put them in the nodeChildren array. Otherwise use empty array
    const nodeChildren = hasChildren ? [...args] : [];

    props.children = nodeChildren
        .filter(Boolean) // Filter out falsy values
        .map(c => (c instanceof Object ? c : createTextElement(c))); // If any children are not objects, make them into objects

    return { type, props };
}

// @param {HTMLElement} dom - the HTML element where props get applied to
// @param {object} props - consists of both attributes and event listeners
function updateDomProperties(dom, previousProps, nextProps) {
    // Function to check if a prop is an event listener
    const isListener = (name) => name.startsWith("on");

    // Function to check if a prop is an attribute
    // As long as it's not a listener, and it is not the 'children' array
    const isAttribute = (name) => !isListener(name) && name !== 'children';

    // Remove previous event listeners
    Object.keys(previousProps)
        .filter(isListener)
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, previousProps[name]);
        });


    // Remove previous attributes
    Object.keys(previousProps)
        .filter(isAttribute)
        .forEach(name => {
            dom[name] = null;
        });
    
    // Set new event listeners
    Object.keys(nextProps)
        .filter(isListener)
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name]);
        });

    // Set new attributes
    Object.keys(nextProps)
        .filter(isAttribute)
        .forEach(name => {
            dom[name] = nextProps[name];
        });
}

let rootInstance = null;

function render(element, parentDom) {
    const previousInstance = rootInstance;
    const nextInstance = reconcile(parentDom, previousInstance, element);
    rootInstance = nextInstance;
}
function reconcile(parentDom, instance, element) {
    if (instance == null) {
        // Initial render
        const newInstance = instantiate(element);
        parentDom.appendChild(newInstance.dom);
        return newInstance;
    } else if (element == null) {
        // Case: a child element was previously present but is not in the new element
        parentDom.removeChild(instance.dom);
        return null;
    } else if (instance.element.type === element.type) {
        updateDomProperties(instance.dom, instance.element.props, element.props);
        instance.childInstances = reconcileChildren(instance, element);
        instance.element = element;
    } else {
        const newInstance = instantiate(element);
        parentDom.replaceChild(newInstance.dom, instance.dom);
        return newInstance;
    }

}

function instantiate(element) {
    const { type, props } = element;
    
    const isTextElement = type === TEXT_ELEMENT;
    const dom = isTextElement
        ? document.createTextNode("")
        : document.createElement(type, props, props?.children);
    
    updateDomProperties(dom, {}, props);

    // Instantiate and append children
    const childElements = props.children || [];
    
    // Recursively call instantiate on each child
    const childInstances = childElements.map(instantiate);
    
    const childDoms = childInstances.map(childInstance => childInstance.dom);
    childDoms.forEach(childDom => dom.appendChild(childDom));

    const instance = {dom, element, childInstances};
    return instance;
}

function reconcileChildren(instance, element) {
    const dom = instance.dom;
    const childInstances = instance.childInstances;
    const nextChildElements = element.props.children || [];
    const newChildInstances = [];
    const count = Math.max(childInstances.length, nextChildElements.length);

    for (let i=0; i < count; i++) {
        const childInstance = childInstances[i];
        const childElement = nextChildElements[i];

        const newChildInstance = reconcile(dom, childInstance, childElement);
        newChildInstances.push(newChildInstance);
    }

    return newChildInstances.filter(instance => instance != null);
}

let globalId = 0;
let globalParent;
let componentState = new Map();

function useState(initialState) {
    const id = globalId;
    const parent = globalParent;

    globalId++;

    return (() => {
        const { cache } = componentState.get(parent);
    
        if(cache[id] == null) {
            // This case denotes that it's the first call of useState for this component
            cache[id] = { 
                value: 
                typeof initialState === 'function' ? initialState() : initialState, 
            };
        }
    
        const setState = (state) => {
            const { component, props } = componentState.get(parent);
            if (typeof state === 'function') {
                cache[id].value = state(cache[id].value);
            } else {
                cache[id].value = state;
            }
            // Need to re-render to affect the changes
            render(component, props);
        };
    
        return [cache[id].value, setState];
    })()

}
function useEffect(callback, dependencies) {
    const id = globalId;
    const parent = globalParent;

    globalId++;

    (() => {
        const { cache } = componentState.get(parent);
    
        if(cache[id] == null) {
            cache[id] = { dependencies: undefined };
        }
    
        // Dependencies being null indicates that they're empty or the first iteration
        // In react, useEffect is always run on the first render, or every re-render if the dependencies are empty
        // So in either of these cases, we want dependenciesChanged to be true so that we run the callback

        const dependenciesChanged = dependencies == null || 
        dependencies.some((dependency, i) => {
                return (
                    cache[id].dependencies == null || 
                    cache[id].dependencies[i] !== dependency
                )
            }
        );

        if (dependenciesChanged) {
            if(cache[id].cleanup != null) cache[id].cleanup();
            cache[id].cleanup = callback();
            cache[id].dependencies = dependencies;
        }

    })();
}
function useMemo(callback, dependencies) {
    const id = globalId;
    const parent = globalParent;

    globalId++;

    return (() => {
        const { cache } = componentState.get(parent);
    
        if(cache[id] == null) {
            cache[id] = { dependencies: undefined };
        }
    
        // Dependencies being null indicates that they're empty or the first iteration
        // In react, useEffect is always run on the first render, or every re-render if the dependencies are empty
        // So in either of these cases, we want dependenciesChanged to be true so that we run the callback

        const dependenciesChanged = dependencies == null || 
        dependencies.some((dependency, i) => {
                return (
                    cache[id].dependencies == null || 
                    cache[id].dependencies[i] !== dependency
                )
            }
        );

        if (dependenciesChanged) {
            cache[id].value = callback();
            cache[id].dependencies = dependencies;
        }

        return cache[id].value

    })()
}

export { createElement, render, useEffect, useMemo, useState };
