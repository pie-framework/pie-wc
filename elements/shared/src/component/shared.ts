import {OutcomeResult} from "../controller/index.js";
import {escapeRegExp} from "lodash";
import {Env, PieElementMapping, PieElementSession, PieModel} from "../model/index.js";
import {createContext} from "@lit/context";

/**
 * Wraps a callback in a proxy that prevents custom elements from being defined more than once (which typically
 * would throw an error).
 * @param callback code to run while the customElements define function is proxied; after the call, the original
 * define function is restored.
 */
export const withCustomElementsProxy = (callback: () => Promise<any>): Promise<any> => {
    const originalDefine = customElements.define;
    const defineProxy = new Proxy(originalDefine, {
        apply(target, thisArg, [name]) {
            if (customElements.get(name)) {
                console.warn(`element ${name} already defined; skipping registration`);
                return;
            }
            return Reflect.apply(target, thisArg, [name]);
        }
    });
    try {
        customElements.define = defineProxy;
        return callback();
    } finally {
        customElements.define = originalDefine;
    }
}

/**
 * Replace the target elements as defined in the markup with the actual elements the web components use.
 * @param pieMeta meta data with mapping to look up the target and actual elements
 * @param markup the markup to replace the elements in
 */
export const replaceCustomElements = (pieMeta: PieElementsMeta, markup: string) => {
    if (!pieMeta) {
        throw new Error("pieMeta is required");
    }
    if (!markup) {
        throw new Error("markup is required");
    }
    let m: string = markup;
    pieMeta.loaded.forEach((meta) => {
        m = replaceTagNameWithAttribute(m, meta.elementMapping.pieTagName, meta.elementMapping.tagName);
    });
    return m;
}

/**
 * In markup, replace instances of searchTag with replaceTag and add attribute 'pie-tag-name' to
 * the opening replaceTag.
 * @param markup markup to do replacement in
 * @param searchTag tag name to search for
 * @param replaceTag tag name to replace with
 */
export const replaceTagNameWithAttribute = (markup: string, searchTag: string, replaceTag: string): string => {
    const tagRegExp = new RegExp(`</?${searchTag}(\\s+[^>]*)?>`, 'g');
    return markup.replace(tagRegExp, (match, attributes) => {
        // Check if it's an opening tag
        if (match.startsWith('</')) {
            return `</${replaceTag}>`;
        } else {
            return `<${replaceTag}${attributes || ''} pie-tag-name="${searchTag}">`;
        }
    });
}

/**
 * Loads model for PIE element.
 */
export interface ElementModelFn<TModel extends PieModel, TSession extends PieElementSession> {
    (host: HTMLElement,
     model: TModel,
     session: TSession,
     env: Env,
     updateSession?: (id: string, element: string, data: any) => Promise<void>,
    ): Promise<TModel>
}

/**
 * Runs outcome for PIE element.
 */
export interface ElementOutcomeFn<TModel extends PieModel, TSession extends PieElementSession> {
    (host: HTMLElement,
     model: TModel,
     session: TSession,
     env: Env,
    ): Promise<OutcomeResult>
}

/**
 * Functions that serve as the controller of players. Items consist of one or more PIE elements (as well as potentially
 * a rubric and/ or passage), and each PIE element has a controller and element session. Just like the player element
 * takes care of rendering the elements that make up the item, the player controller functions tie together these
 * controller invocations of these elements and their sessions.
 *
 * In non-trivial deployments, these sessions (client interactions) are sent to the server for storage and the
 * controller functions are invoked on the server to determine the outcome of the user's interactions if the mode
 * is to evaluate as well as to build the model for the UI that is appropriate for the environment.
 *
 * On top of that, the player controller is responsible for loading the elements and controllers into the browser
 * and making them available for rendering and invocations.
 */
export interface PieController {
    model: ElementModelFn<PieModel, PieElementSession>;
    outcome: ElementOutcomeFn<PieModel, PieElementSession>;
}

/**
 * Information about a single element and its controller.
 */
export interface PieElementMeta {
    /**
     * Controller functions for a PIE element.
     */
    controllerFns: PieController;

    /**
     * The element mapping for the PIE element.
     */
    elementMapping: PieElementMapping;
}

/**
 * Information about the elements and controllers for the given item.
 */
export interface PieElementsMeta {
    loaded: PieElementMeta[];
}

/**
 * Classes that have a function for updating an item session with element session data.
 */
export interface HashSessionUpdater {
    /**
     * Update the item session with the element session data.
     * @param elementSession the element session data
     */
    updateElementSession(elementSession: PieElementSession): void;
}

/**
 * Metadata from PIE that cannot be known by implementations of this code until runtime. For instance,
 * tagNameFromPieMarkup is the tag name that PIE uses in the markup, which may be different from the actual
 * tag name that is used in the browser. This information will be known when the element is loaded, and is
 * used to resolve which model should be used from the item that the element is using.
 *
 * Code that sets up the elements for use, like PieElementsLoader implementations, is responsible for setting
 * this metadata. That outside framework is also responsible for keeping this property up-to-date when e.g.
 * the item that is used changes.
 */
export interface PieMetaData {
    /**
     * The tag name that PIE uses in the markup and that is referenced as 'element' in the model, which may be
     * different from the actual tag name that is used in the browser. This should be set as an attribute on the
     * markup so that it can be used to locate the appropriate model in the item.
     */
    pieTagName: string;
}

export const pieElementsMetaContext = createContext<PieElementsMeta>("pie-ctx-elements-meta");
