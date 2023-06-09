let globalId = 0;
let globalParent;
let componentState = new Map();

const TEXT_ELEMENT = 'TEXT';

export function useState(initialState) {
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
            }
        }
    
        const setState = (state) => {
            const { component, props } = componentState.get(parent)
            if (typeof state === 'function') {
                cache[id].value = state(cache[id].value)
            } else {
                cache[id].value = state;
            }
            // Need to re-render to affect the changes
            render(component, props, parent);
        }
    
        return [cache[id].value, setState];
    })()

};

export function useEffect(callback, dependencies) {
    const id = globalId;
    const parent = globalParent;

    globalId++;

    (() => {
        const { cache } = componentState.get(parent);
    
        if(cache[id] == null) {
            cache[id] = { dependencies: undefined }
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
        )

        if (dependenciesChanged) {
            if(cache[id].cleanup != null) cache[id].cleanup()
            cache[id].cleanup = callback();
            cache[id].dependencies = dependencies;
        }

    })()
};

export function useMemo(callback, dependencies) {
    const id = globalId;
    const parent = globalParent;

    globalId++;

    return (() => {
        const { cache } = componentState.get(parent);
    
        if(cache[id] == null) {
            cache[id] = { dependencies: undefined }
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
        )

        if (dependenciesChanged) {
            cache[id].value = callback();
            cache[id].dependencies = dependencies;
        }

        return cache[id].value

    })()
};

export function createTextElement(nodeValue) {
    return createElement(TEXT_ELEMENT, { nodeValue, children: [] })
}

export function createElement(type, configObject, ...args) {
    const props = Object.assign({}, configObject);
    const hasChildren = args.length > 0;
    const nodeChildren = hasChildren ? [...args] : [];
    props.children = nodeChildren
        .filter(Boolean)
        .map(c => (c instanceof Object ? c : createTextElement(c)));

    return { type, props }
};

export function render(component, props, parent) {
    const state = componentState.get(parent) || { cache: [] };
    componentState.set(parent, {...state, component, props});
    globalParent = parent;
    
    const output = component(props);

    // Set globalId to 0 after we've finished rendering the component
    globalId = 0;

    parent.textContent = output;
};