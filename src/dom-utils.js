import { TEXT_ELEMENT } from "./element.js";


// @param {HTMLElement} dom - the HTML element where props get applied to
// @param {object} props - consists of both attributes and event listeners
export function updateDomProperties(dom, previousProps, nextProps) {
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
            dom.addEventListener(eventType, nextProps[name])
        })

    // Set new attributes
    Object.keys(nextProps)
        .filter(isAttribute)
        .forEach(name => {
            dom[name] = nextProps[name];
        })
};