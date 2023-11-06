import {customElement, property, state} from "lit/decorators.js";
import {html, LitElement} from "lit";
import {consume, provide} from "@lit/context";
import {
    pieEnvContext,
    pieItemContext,
    pieItemSessionContext, pieSessionAutoScoreContext,
    pieToControllerFnsContext
} from "../model/index.js";
import type {Env, PieItem, PieItemSession, SessionAutoScore} from "../model/index.js";
import type {PieToControllerFns} from "../controller/index.js";
import {autoScoreSession} from "../controller/ItemController.js";

/**
 * This container understands how to auto score a pie item.
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

    @consume({context: pieToControllerFnsContext, subscribe: true})
    @state()
    pieToControllerFns: PieToControllerFns;

    @provide({context: pieSessionAutoScoreContext})
    @property({type: Object})
    score: SessionAutoScore;

    render() {
        return html`
            <slot></slot>
        `;
    }

    firstUpdated() {
        this.setAutoScore();
    }

    updated(changedProperties: Map<string | number | symbol, unknown>): void {
        super.updated(changedProperties);
        if (changedProperties.has('itemSession') || changedProperties.has('env')) {
            this.setAutoScore();
        }
    }

    setAutoScore() {
        if (this.env?.mode === 'evaluate') {
            autoScoreSession(this.itemSession, this.item, this.env, this.pieToControllerFns).then(score => {
                console.debug('auto-scored session: %O', score);
                this.score = score;
            }).catch(e => {
                console.error('error auto-scoring session: %O', e);
                this.score = undefined;
            });
        } else {
            this.score = undefined;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-auto-score-container': PieAutoScoreContainer
    }
}

