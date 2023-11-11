import {LitElement} from "lit";
import {property} from "lit/decorators.js";
import {provide} from "@lit/context";
import type {PieItem, PieItemSession} from "../model/index.js";
import {createItemSession, pieItemContext, pieItemSessionContext,} from "../model/index.js";
import {OutcomeResult} from "../controller/index.js";
import type {PieElementsLoaderFn} from "./PieElementsLoader.js";
import {localPieElementsLoader} from "./PieElementsLocalLoader.js";
import type {PieElementsMeta} from "./shared.js";
import {pieElementsMetaContext} from "./shared.js";
import {Task} from "@lit/task";
import {deepArrayEquals} from "@lit/task/deep-equals.js";

export class PieItemContainerBase extends LitElement {

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
            await this.pieElementsLoaded(item, meta, this.itemSession);
            return meta;
        },
        args: () => [this.item],
        autoRun: true,
        argsEqual: deepArrayEquals,
    });

    // template method for subclasses to override; this is called when the pie elements task ran and loaded elements
    async pieElementsLoaded(item: PieItem, meta: PieElementsMeta, itemSession: PieItemSession): Promise<void> {
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

