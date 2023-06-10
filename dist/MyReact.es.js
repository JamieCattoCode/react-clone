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

function render(element, parentNode) {
    try {

        console.log('Parent node:');
        console.log(parentNode);
        console.log('Element:');
        console.log(element);
        
        const isTextElement = (element) => element.type === TEXT_ELEMENT;
        
        const node = isTextElement(element)
        ? document.createTextNode(element?.props?.nodeValue) 
        : document.createElement(element.type, element.props, element.props?.children);

        console.log('Element as node:');
        console.log(node);
        
        // Add node to the parent node
        parentNode.appendChild(node);
        // Call render recursively where the breaking condition is that element === parentNode
        const children = element?.props?.children;
        if (children.length > 0) {
            children.forEach(child => {
                render(child, node);
            });
        } 
    } catch (error) {
        console.log('Failed parent node:');
        console.log(parentNode);
        console.log('Failed element:');
        console.log(element);
        console.log(error);
    }
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
