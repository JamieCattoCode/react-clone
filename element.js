export const TEXT_ELEMENT = 'TEXT';

export function createTextElement(nodeValue) {
    return createElement(TEXT_ELEMENT, { nodeValue, children: [] });
}

export function createElement(type, configObject, ...args) {
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
};