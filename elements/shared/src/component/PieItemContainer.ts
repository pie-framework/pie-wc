import {html} from "lit";
import {customElement} from "lit/decorators.js";
import {PieItemContainerBase} from "./PieItemContainerBase.js";

/**
 * Container component to set up the context for the item and item session and load the elements and
 * controllers for the item. It will postpone rendering children until the elements and controllers are available.
 */
@customElement('pie-item-container')
export class PieItemContainer extends PieItemContainerBase {

    render() {
        return html`
            ${this.loadPieElementsTask.render({
                initial: () => html`<p>waiting to load PIE elements</p>`,
                pending: () => html`<p>loading PIE elements...</p>`,
                complete: (value) => html`
                    <slot></slot>`,
                error: (error) => html`<p>unable to load PIE elements: ${error}</p>`,
            })}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-item-container': PieItemContainer
    }
}
