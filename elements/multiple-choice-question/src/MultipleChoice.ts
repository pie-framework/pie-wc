import {css, html, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import '@material/web/list/list.js';
import {PieElement} from "@pie-wc/shared";
import {MultipleChoicePie, MultipleChoicePieSession} from "@pie-wc/multiple-choice-model";
import './MultipleChoiceItem.js';

@customElement('pie-multiple-choice')
export class MultipleChoice extends PieElement<MultipleChoicePie, MultipleChoicePieSession> {

    render() {
        if (!this.model) return html`
            <div>no model set</div>`;

        const groupRole = this.model.choiceMode === 'radio' ? 'radiogroup' : 'group';
        const groupId = `group-${this.model.id}`;
        this.ariaLabel = this.model.choiceMode === 'radio' ? 'Multiple Choice Question' : 'Multiple Correct Answer Question';

        return html`
            <div role="group"
                 aria-labelledby="question-prompt">
                <div id="question-prompt" class="prompt" role="heading">
                    ${this.model.promptEnabled ? unsafeHTML(this.model.prompt) : nothing}
                </div>
                <div role="${groupRole}" aria-labelledby="${groupId}">
                    <md-list @choice-change=${this.handleChoiceChange}>
                        ${(this.model.choices || []).map((choice, index) => html`
                        <pie-multiple-choice-item
                                .choice=${choice}
                                .index=${index}
                                role="${this.model.choiceMode === 'radio' ? 'radio' : 'checkbox'}">
                        </pie-multiple-choice-item>`
                        )}
                    </md-list>
                </div>
            </div>
        `;
    }

    private handleChoiceChange(event: CustomEvent) {
        console.debug('[multiple-choice] handleChoiceChange: %s', JSON.stringify(event.detail));
        const {id, checked} = event.detail;
        if (!this.session) {
            throw new Error('session not set');
        }
        if (!this.session.value) {
            this.session.value = [];
        }
        if (checked) {
            // add the choice ID to session.values
            this.session.value.push(id);
        } else {
            // remove the choice ID from session.values
            this.session.value = this.session.value.filter(value => value !== id);
        }
        this.signalSessionChanged();
    }

    static styles = css`
      .mdc-card {
        padding: 16px;
        margin: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .prompt {
        font-size: 1.25rem;
        margin-bottom: 16px;
      }

      md-checkbox {
        display: inline-block;
      }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-multiple-choice': MultipleChoice
    }
}
