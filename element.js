export const TEXT_ELEMENT = 'TEXT';

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