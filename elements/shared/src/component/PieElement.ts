import {html, LitElement} from "lit";
import {property, state} from "lit/decorators.js";
import {consume, provide} from '@lit/context';
import type {Env, PieElementSession, PieItemSession, PieItem, PieModel} from "../model/index.js";
import {
    mergeElementSession, pieElementSessionContext,
    pieEnvContext,
    pieItemContext,
    pieItemSessionContext, pieModelContext,
} from "../model/index.js";
import type {HashSessionUpdater, PieElementsMeta, PieMetaData} from "./shared.js";
import {ElementModelFn, pieElementsMetaContext} from "./shared.js";
import {Task} from "@lit/task";
import {deepArrayEquals} from "@lit/task/deep-equals.js";

/**
 * Base class for all pie elements that want to function within the Lit framework.
 *
 * The properties in this class, like model and env, can be set as attributes on the element directly, or provided
 * by a context that is provided higher up the element tree, for instance a player component.
 */
export abstract class PieElement<TModel extends PieModel, TSession extends PieElementSession>
    extends LitElement implements HashSessionUpdater, PieMetaData {

    @property({type: String, attribute: 'pie-tag-name'})
    pieTagName: string;

    @consume({context: pieEnvContext, subscribe: true})
    @property({type: Object})
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

    // @ts-ignore
    @provide({context: pieModelContext})
    @property({type: Object})
    model: TModel;

    // @ts-ignore
    @provide({context: pieElementSessionContext})
    @state()
    session: TSession;

    constructor() {
        super();
        if (this.render !== PieElement.prototype.render) {
            throw new Error("render should not be overridden by subclasses of PieElement");
        }
    }

    /**
     * Task to load the model when everything else - item, pieTagName and pieElementsMeta - is available. Until
     * the model can be determined, the element won't render its children.
     */
    loadModelTask = new Task(this, {
        task: async ([pieTagName, item, pieElementsMeta], {signal}) => {
            if (!item) {
                console.debug("no item available");
                return;
            }
            const rawModel = this.getModelForTag(item as PieItem, pieTagName as string);
            if (!rawModel) {
                throw new Error(`no model available`);
            }
            const element = rawModel.element;
            const elementSession = this.itemSession?.elementSessions?.find(es => es.element === element) as TSession;
            const modelFn = this.getControllerModelFn(this.pieElementsMeta, rawModel);
            const model = await modelFn(this, rawModel, elementSession, this.env);
            this.session = elementSession;
            this.model = model;
            return model;
        },
        args: () => [this.pieTagName, this.item, this.pieElementsMeta],
        autoRun: true,
        argsEqual: deepArrayEquals,
    });

    render() {
        // independent of the loadModel task, the model could be set, e.g. in a test environment; if that
        // is the case, we can render the element directly
        if (this.model) {
            return this.renderElement(this.model);
        }
        // but normally, we'd load from the task (which should also involve the controller, which may mean
        // a round trip to a PIE backend.
        return html`
            ${this.loadModelTask.render({
                initial: () => html`<p>waiting for PIE model to be available</p>`,
                pending: () => html`<p>loading PIE model...</p>`,
                complete: (value) => this.renderElement(this.model),
                error: (error) => html`<p>unable to load PIE model: ${error}</p>`,
            })}`;
    }

    /**
     * Invoked by the PieElement base class when a model is available and when there are updates. This method
     * may return any value renderable by lit-html's `ChildPart` - typically a`TemplateResult`. Setting
     * properties inside this method will *not* trigger the element to update.
     */
    protected abstract renderElement(model: TModel): unknown;

    /**
     * Get the model for the pieTagName that's set on this PIE element. This gets the model from the item that
     * is set on this element, but does not attempt to call the controller model function.
     */
    getModelForTag(item: PieItem, pieTagName: string): TModel {
        if (!item?.config?.models) {
            return undefined;
        }
        if (item.config.models.length === 0) {
            console.error(`no models found in item`);
            return undefined;
        }
        if (!pieTagName) {
            console.warn('pieTagName is required');
            if (this.item.config.models.length === 1) {
                this.pieTagName = this.item.config.models[0].element;
            } else {
                return;
            }
        }
        const model = item.config.models.find(
            model => model.element === this.pieTagName) as TModel;
        if (!model) {
            console.error(`unable to select model for element ${this.pieTagName} from item`);
        }
        return model;
    }

    /**
     * Signal to elements up the hierarchy that there was a change to the current session.
     */
    signalItemSessionChanged() {
        const sessionChangedEvent = new CustomEvent('session-changed', {
            detail: JSON.stringify(this.itemSession),
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(sessionChangedEvent);
    }

    updateElementSession(elementSession: PieElementSession) {
        console.debug('updating element session with: %O', elementSession);
        this.itemSession = mergeElementSession(this.itemSession, elementSession);
        this.signalItemSessionChanged();
    }

    getControllerModelFn(pieElementsMeta: PieElementsMeta, model: PieModel): ElementModelFn<TModel, TSession> {
        if (pieElementsMeta.loaded.length === 0) {
            console.debug('no controller functions found');
            return;
        }
        const meta = pieElementsMeta.loaded.find(
            meta => meta.elementMapping.pieTagName === this.pieTagName);
        if (!meta) {
            if (this.pieElementsMeta.loaded.length === 1) {
                console.warn(`no controller functions found for element ${this.pieTagName}, using first controller functions in item`);
                return meta.controllerFns?.model as any as ElementModelFn<TModel, TSession>;
            } else {
                throw new Error(`no controller functions found for element ${this.pieTagName}`);
            }
        } else {
            return meta.controllerFns?.model as any as ElementModelFn<TModel, TSession>;
        }
    }
}
