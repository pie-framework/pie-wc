import {customElement, property, state} from "lit/decorators.js";
import {html, LitElement} from "lit";
import {consume} from "@lit/context";
import {pieEnvContext, pieSessionAutoScoreContext} from "../model/index.js";
import type {Env} from "../model/index.js";
import type {SessionAutoScore} from "../model/index.js";

/**
 * Display item score when the item uses auto-scoring.
 */
@customElement('pie-auto-score-display')
export class PieAutoScoreDisplay extends LitElement {

    @consume({context: pieEnvContext, subscribe: true})
    @property()
    env: Env;

    @consume({context: pieSessionAutoScoreContext, subscribe: true})
    @property({type: Object})
    score: SessionAutoScore;

    render() {
        if (!this.score || !(this.env.role == 'instructor' && this.env.mode == 'evaluate')) {
            return html`
                <div></div>`;
        }
        return html`
            <div>Score: ${this.score?.points}</div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-auto-score-display': PieAutoScoreDisplay
    }
}

