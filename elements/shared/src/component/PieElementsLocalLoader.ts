import {PieElementsLoaderFn} from "./PieElementsLoader.js";
import {ControllerModelFn, withMergedModel} from "../controller/index.js";
import {Env, PieElementMapping, PieElementSession, PieItem, PieModel} from "../model/index.js";
import {HashSessionUpdater, PieElementMeta, PieElementsMeta, withCustomElementsProxy} from "./shared.js";

const packageToProjectName = (packageName: string): string => {
    const parts = packageName.split('/');
    const name = parts[parts.length - 1];
    return name.replace(/@pie-element\//, '');
}

/**
 * Loader that is useful for local testing. It loads the elements from the local file system, relative to the project.
 * It hooks up the controller functions directly to the elements, which is great for testing, but obviously not
 * suitable for production (where we'd want to run the controller functions on a server).
 */
export const localPieElementsLoader: PieElementsLoaderFn = async (item: PieItem): Promise<PieElementsMeta> => {
    const pies = Object.entries(item.config.elements)
        .map(([element, pie]) => new PieElementMapping(pie, element));
    return withCustomElementsProxy(async () => {
        const meta = await Promise.all(
            pies.map(pieElementMapping => loadPieElementAndController(pieElementMapping, item)));
        return <PieElementsMeta>{
            loaded: meta
        }
    });
}

export const loadPieElementAndController = async (mapping: PieElementMapping, item: PieItem) => {
    const project = packageToProjectName(mapping.piePackage.name);
    let elementLocation = `../../../${project}-question/dist/index.js`;
    const elementModule = await import(/* @vite-ignore */elementLocation);
    if (!elementModule) {
        throw new Error(`no module found for ${mapping.pie} (at ${elementLocation})`);
    }
    if (!elementModule.default) {
        throw new Error(`no default export found for ${mapping.pie} (at ${elementLocation})`);
    }
    const PieElementClass = elementModule.default;
    const elementName = new PieElementClass().tagName?.toLowerCase();
    mapping.tagName = elementName;
    console.debug('elementName: %O', elementName);
    if (!customElements.get(elementName)) {
        customElements.define(elementName, PieElementClass);
        console.info('defined pie %s as element %s', mapping.pie, elementName);
    } else {
        console.debug('pie %s already defined as element %s', mapping.pie, elementName);
    }

    let controllerLocation = `../../../${project}-controller/dist/index.js`;
    const module = await import(/* @vite-ignore */controllerLocation);
    if (!module) {
        throw new Error(`no module found for ${mapping.pie} (at ${controllerLocation})`);
    }
    if (!module.model) {
        throw new Error(`no model found for ${mapping.pie} (at ${controllerLocation})`);
    }
    if (!module.outcome) {
        throw new Error(`no controller found for ${mapping.pie} (at ${controllerLocation})`);
    }

    return <PieElementMeta>{
        elementMapping: mapping,
        controllerFns: {
            model: withElementSessionMutator(withMergedModel(module.model)),
            outcome: (host: HTMLElement,
                      model: PieModel,
                      session: PieElementSession,
                      env: Env,
                      updateSession?: (id: string, element: string, data: any) => Promise<void>,
            ) => module.outcome(model, session, env, updateSession)
        },
    };
}

export const withElementSessionMutator =
    (fn: ControllerModelFn<PieModel, PieElementSession>) =>
        (host: HTMLElement & Partial<HashSessionUpdater>, model: PieModel, session: PieElementSession, env: Env) => {
            // Check if updateElementSession exists and is a function
            if (typeof host.updateElementSession === 'function') {
                const updateSession = async (id: string, element: string, data: any): Promise<void> => {
                    host.updateElementSession({id, element, data});
                    return;
                };
                return fn(model, session, env, updateSession);
            } else {
                console.warn('updateElementSession function not found on the host object.');
                // Call the original function without the custom updateSession
                return fn(model, session, env);
            }
        }
