import {  TEXT_ELEMENT } from "./element.js"
import { updateDomProperties } from "./dom-utils.js";

let rootInstance = null;

export function render(element, parentDom) {
    const previousInstance = rootInstance;
    const nextInstance = reconcile(parentDom, previousInstance, element);
    rootInstance = nextInstance;
};

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
        updateDomProperties(instance.dom, instance.element.props, element.props)
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
        : document.createElement(type, props, props?.children)
    
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