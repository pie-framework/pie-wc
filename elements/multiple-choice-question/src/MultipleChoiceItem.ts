import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {consume} from "@lit/context";
import '@material/web/checkbox/checkbox.js';
import '@material/web/radio/radio.js';
import '@material/web/divider/divider.js';
import '@material/web/list/list-item.js';

import type {Choice, Env} from "@pie-wc/shared";
import {pieEnvContext, pieModelContext, svgForCheck, svgForCross} from "@pie-wc/shared";
import type {MultipleChoicePie} from "@pie-wc/multiple-choice-model";

@customElement('pie-multiple-choice-item')
export class MultipleChoiceItem extends LitElement {

    @property({type: Object})
    choice: Choice;

    @property({type: Number})
    index: number;

    @consume({context: pieEnvContext, subscribe: true})
    @property({type: Object})
    env: Env;

    // @ts-ignore
    @consume({context: pieModelContext, subscribe: true})
    @property({type: Object})
    model: MultipleChoicePie;

    @property({type: Boolean})
    checked: boolean;

    static styles = css`

      label {
        display: flex;
        align-items: center;
      }

      label div {
        display: inline-block;
      }

      .choice-marker {
        width: 33px;
        height: 33px;
      }

      .choice-row {
        display: flex;
      }
    `;

    private evaluateChoice(): boolean {
        return Boolean(this.checked) === Boolean(this.choice.correct);
    }

    private getMarker() {
        const marker = this.evaluateChoice() ? svgForCheck() : svgForCross();
        return html`
            <div class="choice-marker">${marker}</div>`;
    }

    private handleInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.checked = input.checked;
        // dispatch event so that parent (multiple choice item) can update session
        const changeEvent = new CustomEvent('choice-change', {
            detail: {id: this.choice.value, checked: this.checked},
            bubbles: true,
            composed: true // allows the event to bubble through shadow DOM
        });
        this.dispatchEvent(changeEvent);
    }

    render() {
        return html`
            <md-list-item role="option">
                <div class="choice-row">
                    ${(this.env?.mode === 'evaluate' && this.env?.role === 'instructor') ? this.getMarker() : nothing}
                    ${this.renderOption()}
                    ${this.renderLabel()}
                </div>
            </md-list-item>
            <md-divider inset></md-divider>
        `;
    }

    private renderLabel() {
        return html`
            <label for="${this.choice.value}">
                <span class="choice-label">
                    <div>${choicePrefix(this.model, this.index)}.&nbsp</div>${unsafeHTML(this.choice.label)}
                </span>
            </label>`;
    }

    private renderOption() {
        const isDisabled = this.env?.mode === 'view';
        if (this.model.choiceMode === 'radio') {
            return html`
                <md-radio id="${this.choice.value}"
                          @change=${this.handleInputChange}
                          ?disabled=${isDisabled}
                          ?checked=${this.checked}
                          touch-target="wrapper"></md-radio>`;
        } else {
            return html`
                <md-checkbox id="${this.choice.value}"
                             @change=${this.handleInputChange}
                             ?disabled=${isDisabled}
                             ?checked=${this.checked}
                             touch-target="wrapper"></md-checkbox>`;
        }
    }
}

const choicePrefix = (model: MultipleChoicePie, index: number): string => {
    if (model.choicePrefix === 'letters') {
        return numberToLetter(index + 1);
    } else {
        return `${index + 1}`;
    }
}

const numberToLetter = (num: number): string => {
    if (num < 1 || num > 26) {
        console.warn("Input '%s' must be a number between 1 and 26", num);
    }
    return String.fromCharCode(64 + num);
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-multiple-choice-item': MultipleChoiceItem;
    }
}
