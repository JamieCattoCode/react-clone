import { TEXT_ELEMENT } from "./element.js";


// @param {HTMLElement} dom - the HTML element where props get applied to
// @param {object} props - consists of both attributes and event listeners
export function updateDomProperties(dom, props) {
    // Function to check if a prop is an event listener
    const isListener = (name) => name.startsWith("on");

    // Make an array of props' keys
    Object.keys(props)
        .filter(isListener) // Remove any which are not event listeners
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2); // Return event type by getting everything after 'on'
            dom.addEventListener(eventType, props[name]); // Add the event listener's value to the dom
        });

    // Function to check if a prop is an attribute
    // As long as it's not a listener, and it is not the 'children' array
    const isAttribute = (name) => !isListener(name) && name !== 'children';

    // Make an array of props' keys
    Object.keys(props)
        .filter(isAttribute) // Remove any which are not attributes
        .forEach(name => {
            dom[name] = props[name]
        });
};