export function render(component, props, parent) {
    const output = component(props);
    parent.textContent = output;
}