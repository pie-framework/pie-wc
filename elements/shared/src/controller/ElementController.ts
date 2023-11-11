/**
 * A collection of functions that are used to build the model and determine the outcome of a PIE item.
 * In non-trivial deployments, these functions are invoked on the server and the results are sent to the
 * client. Though in simple deployments where security isn't a concern, these functions can be invoked on
 * the client instead and bundled with the PIE elements.
 */
import {PieModel, Env, PieElementSession} from "../model/index.js";
import {createContext} from "@lit/context";

/**
 * The result of invoking the outcome function of a controller module.
 */
export interface OutcomeResult {
    score?: number;
    empty?: boolean;
    completed?: boolean;

    [key: string]: any;
}

/**
 * Invoke the model function of the controller module. This function builds the model used by the
 * PIE Element to render the ui. Think of it as the UI model. The output of this function is dependent on
 * the pie and how it builds the UI. The key thing is that this method will only return an appropriate
 * model for the env settings. For example if 'env.mode' is 'gather' or 'view', the returned model
 * should not contain any data that would indicate what the correct response might be. Obviously, the
 * reason this invocation is done on the server is to prevent the client from seeing the correct response
 * if that is not appropriate for the env settings.
 *
 * @param model - question part of the PIE item the invocation is for.
 * @param session - item session info for the invocation.
 * @param env - env settings for the invocation (e.g. mode, role, etc.)
 * @param updateSession - a function that will set the properties passed into it on the session (optional).
 */
export interface ControllerModelFn<TModel extends PieModel, TSession extends PieElementSession> {
    (model: TModel,
     session: TSession,
     env: Env,
     updateSession?: (id: string, element: string, data: any) => Promise<void>,
    ): Promise<TModel>
}

/**
 * We typically want to keep the model input that's (potentially) not handled by the controller function, so typically
 * we'd want to wrap the call and merge the output over our input rather than just taking the output. This function
 * helps with that.
 * @param fn model function to wrap
 */
export const withMergedModel = <TModel extends PieModel, TSession extends PieElementSession>(
    fn: ControllerModelFn<TModel, TSession>
): ControllerModelFn<TModel, TSession> => {
    return async function (model: TModel, session: TSession, env: Env, updateSession?: (id: string, element: string, data: any) => Promise<void>): Promise<TModel> {
        const result = await fn(model, session, env, updateSession);
        return {...model, ...result};
    };
}

/**
 * Invoke the outcome function of the controller module. This function is used to determine the outcome of the user's
 * interactions with the PIE item (i.e. the session).
 *
 * @param model - question part of the PIE item the invocation is for.
 * @param session - item session info for the invocation.
 * @param env - env settings for the invocation (e.g. mode, role, etc.)
 */
export interface ControllerOutcomeFn<TModel extends PieModel, TSession extends PieElementSession> {
    (model: TModel,
     session: TSession,
     env: Env
    ): Promise<OutcomeResult>
}

export const pieControllerModelFnContext = createContext<PieModel>("pie-ctx-controller-model-fn");

export const pieControllerOutcomeFnContext = createContext<PieModel>("pie-ctx-controller-outcome-fn");
