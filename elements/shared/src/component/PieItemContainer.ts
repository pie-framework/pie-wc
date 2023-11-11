import {html, LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";
import {provide} from "@lit/context";
import {
    createItemSession,
    pieItemContext,
    pieItemSessionContext,
} from "../model/index.js";
import type {PieItem, PieItemSession} from "../model/index.js";
import {OutcomeResult} from "../controller/index.js";
import type {PieElementsLoaderFn} from "./PieElementsLoader.js";
import {localPieElementsLoader} from "./PieElementsLocalLoader.js";
import type {PieElementsMeta} from "./shared.js";
import {pieElementsMetaContext} from "./shared.js";
import {Task} from "@lit/task";
import {deepArrayEquals} from "@lit/task/deep-equals.js";

/**
 * Container component to set up the context for the item and item session and load the elements and
 * controllers for the item. It will postpone rendering children until the elements and controllers are available.
 */
@customElement('pie-item-container')
export class PieItemContainer extends LitElement {

    @provide({context: pieItemContext})
    @property({type: Object})
    item: PieItem;

    @provide({context: pieItemSessionContext})
    @property({type: Object})
    itemSession: PieItemSession

    @property({type: Object})
    pieLoader: PieElementsLoaderFn = localPieElementsLoader;

    @property({type: Object})
    sessionUpdatedFn: SessionUpdatedFn;

    @property({type: Object})
    scoreSessionFn: ScoreSessionFn;

    @provide({context: pieElementsMetaContext})
    @property()
    pieElementsMeta: PieElementsMeta;

    loadPieElementsTask = new Task(this, {
        task: async ([item], {signal}) => {
            if (!item) {
                console.debug("no item available");
                return;
            }
            const meta = await this.pieLoader(item);
            this.pieElementsMeta = meta;
            this.itemSession = this.itemSession || createItemSession(item);
            return meta;
        },
        args: () => [this.item],
        autoRun: true,
        argsEqual: deepArrayEquals,
    });

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

    handleSessionChange(evt: any) {
        const s = JSON.parse(evt.detail);
        console.debug('session changed: %O (was: %O)', s, this.itemSession);
        this.itemSession = s;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('session-changed', this.handleSessionChange);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('session-changed', this.handleSessionChange);
    }
}

/**
 * Called when the session was updated. Non-trivial use would be to send the interaction(s) to the server for storage.
 */
export interface SessionUpdatedFn {
    (session: PieItemSession): Promise<void>
}

/**
 * Get the outcome (score) for the session.
 */
export interface ScoreSessionFn {
    (session: PieItemSession): Promise<OutcomeResult[]>
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-item-container': PieItemContainer
    }
}
