import {customElement, property, state} from "lit/decorators.js";
import {css, html, PropertyValues} from "lit";
import {consume, provide} from '@lit/context';
import {pieEnvContext, PieItem, PieItemSession} from "../model/index.js";
import type {Env} from "../model/index.js";
import {PieElementsMeta, replaceCustomElements} from "./shared.js";
import {PieItemContainerBase} from "./PieItemContainerBase.js";

/**
 * Renders the appropriate pie elements for the given item and uses pie item container to set up the plumbing.
 */
@customElement('pie-item-player')
export class PieItemPlayer extends PieItemContainerBase {

    @consume({context: pieEnvContext, subscribe: true})
    @provide({context: pieEnvContext})
    @property()
    env: Env;

    @state()
    pieElementsFragment: HTMLElement;

    render() {
        return html`
            ${this.loadPieElementsTask.render({
                initial: () => html`<p>waiting to load PIE elements</p>`,
                pending: () => html`<p>loading PIE elements...</p>`,
                complete: (value) => html`${this.pieElementsFragment}`,
                error: (error) => html`<p>unable to load PIE elements: ${error}</p>`,
            })}`;
    }

    async pieElementsLoaded(item: PieItem, meta: PieElementsMeta, itemSession: PieItemSession): Promise<void> {
        await super.pieElementsLoaded(item, meta, itemSession);
        const markup = replaceCustomElements(this.pieElementsMeta, this.item.config.markup);
        this.pieElementsFragment = new DOMParser().parseFromString(markup, 'text/html').body;
    }

    static styles = css`
      .mdc-card {
        padding: 16px;
        margin: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-item-player': PieItemPlayer
    }
}

