import {html, LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";
import {provide} from "@lit/context";
import {pieEnvContext} from "../model/index.js";
import type {Env} from "../model/index.js";

/**
 * Top level component that sets up and provides the environment to run other PIE components in.
 */
@customElement('pie-container')
export class PieContainer extends LitElement {

    @provide({context: pieEnvContext})
    @property()
    env: Env;

    render() {
        return html`
            <slot></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-container': PieContainer
    }
}
