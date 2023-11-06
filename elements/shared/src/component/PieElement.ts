import {LitElement, PropertyValues} from "lit";
import {property, state} from "lit/decorators.js";
import {consume, provide} from '@lit/context';
import type {Env, PieElementSession, PieItemSession, PieItem, PieModel} from "../model/index.js";
import {
    pieEnvContext,
    pieItemContext,
    pieItemSessionContext,
    pieModelContext,
    pieToControllerFnsContext
} from "../model/index.js";
import type {ControllerModelFn, ControllerOutcomeFn, OutcomeResult, PieToControllerFns} from "../controller/index.js";
import {pieControllerModelFnContext, pieControllerOutcomeFnContext} from "../controller/index.js";

/**
 * Base class for all pie elements that want to function within the Lit framework.
 *
 * The properties in this class, like model and env, can be set as attributes on the element directly, or provided
 * by a context that is provided higher up the element tree, for instance a player component.
 */
export abstract class PieElement<TModel extends PieModel, TSession extends PieElementSession> extends LitElement {

    @consume({context: pieEnvContext, subscribe: true})
    @property({type: Object})
    env: Env;

    @consume({context: pieItemContext, subscribe: true})
    @property({type: Object})
    item: PieItem;

    @consume({context: pieItemSessionContext, subscribe: true})
    @property({type: Object})
    itemSession: PieItemSession;

    // @ts-ignore
    @provide({context: pieModelContext})
    @property()
    model: TModel;

    @state()
    session: TSession;

    @consume({context: pieToControllerFnsContext, subscribe: true})
    @state()
    pieToControllerFns: PieToControllerFns;

    // @ts-ignore
    @provide({context: pieControllerModelFnContext})
    @property({type: Object})
    controllerModelFn: ControllerModelFn<TModel, TSession> =
        async (model, session, env, updateSession): Promise<TModel> => model;

    // @ts-ignore
    @provide({context: pieControllerOutcomeFnContext})
    @property({type: Object})
    controllerOutcomeFn: ControllerOutcomeFn<TModel, TSession> =
        async (model, session, env) =>
            ({score: 0, completed: false} as OutcomeResult);

    updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (changedProperties.has('pieToControllerFns')) {
            this.setControllerFns();
        }
        if (changedProperties.has('item')) {
            this.setModel();
        }
        if (changedProperties.has('itemSession')) {
            this.setElementSession();
        }
    }

    setControllerFns() {
        if (!this.pieToControllerFns) {
            console.debug('no controller functions available yet');
            return;
        }
        if (!this.model) {
            console.debug('no model available yet');
            return;
        }
        if (this.pieToControllerFns.size === 0) {
            console.debug('no controller functions found');
            return;
        }
        const fns = this.pieToControllerFns.findForElement(this.tagName);
        if (!fns) {
            if (this.pieToControllerFns.size === 1) {
                console.warn(`no controller functions found for element ${this.tagName}, using first controller functions in item`);
                this.controllerModelFn = this.pieToControllerFns.values[0].model as any as ControllerModelFn<TModel, TSession>;
                this.controllerOutcomeFn = this.pieToControllerFns.values[0].outcome;
            } else {
                console.debug(`no controller functions found for element ${this.tagName}`);
            }
        } else {
            this.controllerModelFn = fns.model as any as ControllerModelFn<TModel, TSession>;
            this.controllerOutcomeFn = fns.outcome;
        }
        this.setModel();
    }

    setModel() {
        this.model = this.modelForTag();
        if (this.model) {
            this.setElementSession();
            if (this.session && this.env && this.controllerModelFn) {
                // console.debug('updating model; model: %O, session: %O, env: %O', this.model, this.session, this.env);
                this.controllerModelFn(this.model, this.session, this.env)
                    .then((model) => {
                        console.info('model update: %O -> %O', this.model, model);
                        this.model = model;
                        this.requestUpdate();
                    }).catch((error) => {
                    console.error('error updating model:', error);
                })
            }
        }
    }

    modelForTag(): TModel {
        if (!this.item || !this.item.config || !this.item.config.models) {
            return undefined;
        }
        if (this.item.config.models.length === 0) {
            console.error(`no models found in item`);
            return undefined;
        }
        const model = this.item.config.models.find(
            model => model.element === this.tagName.toLowerCase()) as TModel;
        if (!model) {
            if (this.item.config.models.length === 1) {
                console.warn(`no model found for element ${this.tagName.toLowerCase()}, using first model in item`);
                return this.item.config.models[0] as TModel;
            }
            console.error(`unable to select model for element ${this.tagName.toLowerCase()} from item with multiple models`);
        }
    }

    /**
     * Set (or unset) the element session based on the item session and the model for this component.
     */
    setElementSession() {
        if (!this.itemSession || !this.model) {
            this.session = undefined;
            return;
        }
        const modelId = this.model.id;
        const elementSessionRef = this.itemSession.elementSessions.find(es => es.modelId === modelId);
        if (elementSessionRef) {
            this.session = elementSessionRef.session as TSession;
        } else {
            throw new Error(`no element session found for model ${modelId} in session ${JSON.stringify(this.itemSession)}`);
        }
    }

    signalSessionChanged() {
        const sessionChangedEvent = new CustomEvent('session-changed', {
            detail: JSON.stringify(this.itemSession),
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(sessionChangedEvent);
    }
}
