import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import {consume} from '@lit/context';
import type {PieItem} from "@pie-wc/shared";
import {pieItemContext, pieToControllerFnsContext} from "@pie-wc/shared";
import type {PieToControllerFns} from "@pie-wc/shared";

@customElement('pie-question-player')
export class QuestionPlayer extends LitElement {

    @consume({context: pieItemContext, subscribe: true})
    @property()
    item: PieItem;

    /**
     holds map of controller functions for each pie element, and also serves as an indicator
     whether elements are loaded in the first place
     */
    @consume({context: pieToControllerFnsContext, subscribe: true})
    @state()
    pieToControllerFns: PieToControllerFns;

    render() {
        if (!this.item) return html`
            <div>no item set</div>`;

        if (!this.item.config) return html`
            <div>invalid item</div>`;

        if (!this.item.config.models || this.item.config.models.length < 1) return html`
            <div>no models set</div>`;

        if (!this.pieToControllerFns) return html`
            <div>loading...</div>`;

        const pieElementsFragment = new DOMParser().parseFromString(this.item.config.markup, 'text/html');
        this.item.config.models.forEach(model => {
            pieElementsFragment.querySelectorAll(model.element).forEach(el => {
                el['model'] = model;
                // TODO this should probably route via player controller fns?
                const pie = this.item.config.elements[model.element];
                if (!pie) {
                    throw new Error(`no pie reference found for element ${model.element}`);
                }
                if (!this.pieToControllerFns[pie] || !this.pieToControllerFns[pie].model) {
                    throw new Error(`controller functions missing for pie ${pie} (mapping is ${JSON.stringify(this.pieToControllerFns)})`);
                }
                el['controllerModelFn'] = this.pieToControllerFns[pie].model;
                el['controllerOutcomeFn'] = this.pieToControllerFns[pie].outcome;
            });
        });

        return html`
            ${pieElementsFragment.body}
        `;
    }

    static styles = css`
      .mdc-card {
        padding: 16px;
        margin: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-question-player': QuestionPlayer
    }
}

