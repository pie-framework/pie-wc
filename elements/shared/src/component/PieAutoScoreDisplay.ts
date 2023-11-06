import {customElement, property, state} from "lit/decorators.js";
import {html, LitElement} from "lit";
import {consume} from "@lit/context";
import {pieSessionAutoScoreContext} from "../model/index.js";
import type {SessionAutoScore} from "../model/index.js";

/**
 * Display item score when the item uses auto-scoring.
 */
@customElement('pie-auto-score-display')
export class PieAutoScoreDisplay extends LitElement {

    @consume({context: pieSessionAutoScoreContext, subscribe: true})
    @property({type: Object})
    score: SessionAutoScore;

    render() {
        if (!this.score) {
            return html`<div></div>`;
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

