import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, PropertyValues} from "lit";
import {consume, provide} from '@lit/context';
import {pieItemContext, pieEnvContext} from "../model/index.js";
import type {PieItem, Env} from "../model/index.js";
import {pieElementsMetaContext, replaceCustomElements} from "./shared.js";
import type {PieElementsMeta} from "./shared.js";

/**
 * Renders the appropriate pie elements for the given item and uses pie item container to set up the plumbing.
 */
@customElement('pie-item-player')
export class PieItemPlayer extends LitElement {

    @provide({context: pieEnvContext})
    @property()
    env: Env;

    @provide({context: pieItemContext})
    @property()
    item: PieItem;

    @consume({context: pieElementsMetaContext, subscribe: true})
    @property()
    pieElementsMeta: PieElementsMeta;

    @state()
    pieElementsFragment: HTMLElement;

    render() {
        return html`
            <pie-container .env=${this.env}>
                <pie-item-container .item=${this.item}>
                    ${this.pieElementsFragment}
                </pie-item-container>
            </pie-container>
        `;
    }

    willUpdate(changedProperties: PropertyValues<this>) {
        if (changedProperties.has('pieElementsMeta')) {
            const markup = replaceCustomElements(this.pieElementsMeta, this.item.config.markup);
            this.pieElementsFragment = new DOMParser().parseFromString(markup, 'text/html').body;
        }
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

