import { createElement, createTextElement, TEXT_ELEMENT } from "./element.js"

export function render(element, parentNode) {
    const isTextElement = (element) => element.type === TEXT_ELEMENT;

    // Convert virtual DOM HTML element object to actual DOM node    
    const node = isTextElement(element)
        ? document.createTextNode(element?.props?.nodeValue) 
        : document.createElement(element.type, element.props, element.props?.children)

    // Add node to the parent node
    parentNode.appendChild(node);

    // Call render recursively for each child
    const children = element?.props?.children;
    if (children.length > 0) {
        children.forEach(child => {
            render(child, node);
        });
    } 
}