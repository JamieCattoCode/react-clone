import { render } from "./MyReact.js";
import Component from "./Component.js";

let propCount = 0;

document.getElementById('btn-prop').addEventListener('click', () => {
    propCount++;
    renderComponent();
})

function renderComponent() {
    render(Component, { propCount, buttonElement: document.getElementById('btn-count') }, document.getElementById('root'));
    render(Component, { propCount, buttonElement: document.getElementById('btn-count-2') }, document.getElementById('root-2'));
};

renderComponent();