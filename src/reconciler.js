import { createElement, createTextElement, TEXT_ELEMENT } from "./element.js"

export function render(element, parentNode) {
    const node = element.type === TEXT_ELEMENT
    ? createTextElement(element) 
    : createElement(element)
    // Add node to the parent node
    parentNode.appendChild(node);
    // Call render recursively where the breaking condition is that element === parentNode
    const children = element?.props?.children;
    if (children.length > 0) {
        children.forEach(child => {
            render(child, element);
        });
    } 
}