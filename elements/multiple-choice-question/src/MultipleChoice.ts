import {css, html, nothing} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import '@material/web/list/list.js';
import {PieElement} from "@pie-wc/shared";
import type {MultipleChoicePie, MultipleChoicePieSession} from "@pie-wc/multiple-choice-model";
import './MultipleChoiceItem.js';

@customElement('pie-multiple-choice')
export class MultipleChoice extends PieElement<MultipleChoicePie, MultipleChoicePieSession> {


    renderElement(model: MultipleChoicePie) {
        if (!model) return html`
            <div>no model set</div>`;

        const groupRole = model.choiceMode === 'radio' ? 'radiogroup' : 'group';
        const groupId = `group-${model.id}`;
        this.ariaLabel = model.choiceMode === 'radio' ? 'Multiple Choice Question' : 'Multiple Correct Answer Question';

        return html`
            <div role="group"
                 aria-labelledby="question-prompt">
                <div id="question-prompt" class="prompt" role="heading">
                    ${model.promptEnabled ? unsafeHTML(model.prompt) : nothing}
                </div>
                <div role="${groupRole}" aria-labelledby="${groupId}">
                    <md-list @choice-change=${this.handleChoiceChange}>
                        ${(model.choices || []).map((choice, index) => html`
                            <pie-multiple-choice-item
                                    .choice=${choice}
                                    .index=${index}
                                    .checked=${this.isChecked(choice.value)}
                                    role="${model.choiceMode === 'radio' ? 'radio' : 'checkbox'}">
                            </pie-multiple-choice-item>`
                        )}
                    </md-list>
                </div>
            </div>
        `;
    }

    isChecked(choiceId: string) {
        const session = this.session;
        if (!session || !session.value) {
            return false;
        }
        return session.value.includes(choiceId);
    }

    handleChoiceChange(event: CustomEvent) {
        console.debug('[multiple-choice] handleChoiceChange: %s', JSON.stringify(event.detail));
        const {id, checked} = event.detail;
        const session = this.session;
        if (!session) {
            throw new Error('session not set');
        }
        if (!session.value) {
            session.value = [];
        }
        if (checked) {
            // add the choice ID to session.values
            session.value.push(id);
        } else {
            // remove the choice ID from session.values
            session.value = session.value.filter(value => value !== id);
        }
        this.updateElementSession(session);
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
