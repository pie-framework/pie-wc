import {customElement, property} from "lit/decorators.js";
import {html, LitElement} from "lit";
import {consume, provide} from "@lit/context";
import {
    pieEnvContext,
    pieItemContext,
    pieItemSessionContext,
    pieSessionAutoScoreContext,
} from "../model/index.js";
import type {Env, PieItem, PieItemSession, SessionAutoScore} from "../model/index.js";
import {autoScoreSession} from "../controller/ItemController.js";
import type {PieElementsMeta} from "./shared.js";
import {pieElementsMetaContext} from "./shared.js";
import {Task} from "@lit/task";
import {deepArrayEquals} from "@lit/task/deep-equals.js";

/**
 * This makes a score available to child components when appropriate.
 */
@customElement('pie-auto-score-container')
export class PieAutoScoreContainer extends LitElement {

    @consume({context: pieEnvContext, subscribe: true})
    @property()
    env: Env;

    @consume({context: pieItemContext, subscribe: true})
    @property({type: Object})
    item: PieItem;

    @consume({context: pieItemSessionContext, subscribe: true})
    @property({type: Object})
    itemSession: PieItemSession;

    @consume({context: pieElementsMetaContext, subscribe: true})
    @property()
    pieElementsMeta: PieElementsMeta;

    @provide({context: pieSessionAutoScoreContext})
    @property({type: Object})
    score: SessionAutoScore;

    autoScoreTask = new Task(this, {
        task: async ([env, item, pieElementsMeta, itemSession], {signal}) => {
            if (!itemSession) {
                console.debug("[auto score container] no session available");
                return;
            }
            if (!(this.env.role == 'instructor' && this.env.mode == 'evaluate')) {
                console.debug("[auto score container] not in instructor evaluate mode, so setting score to undefined");
                this.score = undefined;
                return;
            }
            const score = await autoScoreSession(
                this, itemSession as PieItemSession, item as PieItem, env as Env, pieElementsMeta as PieElementsMeta);
            console.debug("[auto score container] setting score to: %O (based on item session %O)", score, itemSession);
            this.score = score;
            return score;
        },
        args: () => [this.env, this.item, this.pieElementsMeta, this.itemSession],
        autoRun: true,
        argsEqual: deepArrayEquals,
    });

    render() {
        return html`
            ${this.autoScoreTask.render({
                initial: () => html`<p>waiting to load PIE and environment</p>`,
                pending: () => html`<p>scoring...</p>`,
                complete: (value) => html`
                    <slot></slot>`,
                error: (error) => html`<p>unable to score: ${error}</p>`,
            })}`;
    }

    updated(changedProperties: Map<string | number | symbol, unknown>) {
        super.updated(changedProperties);
        if (changedProperties.has('itemSession')) {
            console.debug('[auto score container] item session changed: %O', this.itemSession);
            this.autoScoreTask.run().then(r => console.debug('[auto score container] auto score task completed: %O', r));
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-auto-score-container': PieAutoScoreContainer
    }
}

