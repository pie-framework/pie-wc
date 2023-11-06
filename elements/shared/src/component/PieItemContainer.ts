import {html, LitElement} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {provide} from "@lit/context";
import {
    createItemSession,
    PieElementMapping,
    pieItemContext,
    pieItemSessionContext,
    pieToControllerFnsContext
} from "../model/index.js";
import type {PieItem, PieItemSession} from "../model/index.js";
import {OutcomeResult} from "../controller/index.js";
import type {PieToControllerFns} from "../controller/index.js";
import type {PieElementsLoaderFn} from "./PieElementsLoader.js";
import {localPieElementsLoader} from "./PieElementsLocalLoader.js";

/**
 * Container component to set up the context for the item and item session and load the elements and
 * controllers for the item.
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

    /**
     holds map of controller functions for each pie element, and also serves as an indicator
     whether elements are loaded in the first place
     */
    @provide({context: pieToControllerFnsContext})
    @state()
    pieToControllerFns: PieToControllerFns;

    render() {
        return html`
            <slot></slot>`;
    }

    loadPieElements() {
        this.pieToControllerFns = null;
        loadPies(this.item, this.pieLoader)
            .then((fns) => {
                this.pieToControllerFns = fns;
                console.debug('elements and controller functions loaded: %O', this.pieToControllerFns);
                this.itemSession = createItemSession(this.item);
                console.debug('item session created: %O', this.itemSession);
                this.requestUpdate();
            })
            .catch((error) => {
                console.error('error loading custom elements and/ or controller functions:', error);
            });
    }

    firstUpdated() {
        this.loadPieElements();
    }


    handleSessionChange(evt) {
        const s = JSON.parse(evt.detail);
        // we need to do this to trigger a change in the session that Lit can then react to
        console.debug('session changed: %O', s);
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

/**
 * Load the elements and controllers for the elements in the item.
 * @param item the item to load the elements for
 * @param loader the loader function that will load the elements and controllers
 */
export const loadPies = async (item: PieItem, loader: PieElementsLoaderFn): Promise<PieToControllerFns> => {
    if (!item) {
        throw new Error("Item is required");
    }
    if (!item.config?.elements || Object.values(item.config.elements).length === 0) {
        throw new Error("Item has no elements");
    }
    if (!loader) {
        throw new Error("Loader is required");
    }
    return loader(Object.entries(item.config.elements)
        .map(([element, pie]) => new PieElementMapping(pie, element)));
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-item-container': PieItemContainer
    }
}
