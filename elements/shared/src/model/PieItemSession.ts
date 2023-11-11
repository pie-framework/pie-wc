import {PieElementSession} from "./PieElementSession.js";
import {PieItem} from "./PieItem.js";
import {createContext} from "@lit/context";

/**
 * An item session consists of one or more element sessions for the elements and their models in the item.
 */
export interface PieItemSession {
    id: string;
    elementSessions: PieElementSession[];
}

export const createItemSession = (item: PieItem, id?: string): PieItemSession => {
    if (!item) {
        throw new Error("Item is required");
    }
    if (!item.config || !item.config.models || item.config.models.length === 0) {
        throw new Error("Item has no models");
    }
    return <PieItemSession>{
        id: id || crypto.randomUUID(),
        elementSessions: item.config.models.map(model => {
            const element = model.element;
            const pie = item.config.elements[element];
            if (!pie) {
                throw new Error(`No pie found for element ${element}`);
            }
            return <PieElementSession>{
                id: crypto.randomUUID(),
                element: element,
            };
        })
    };
};

/**
 * Update the element session in the item session.
 * @param itemSession the item session to update
 * @param elementSession the element session to update
 */
export const mergeElementSession = (itemSession: PieItemSession, elementSession: PieElementSession): PieItemSession => {
    if (!itemSession) {
        throw new Error("item session is required");
    }
    if (!elementSession) {
        console.warn("no element session provided");
        return itemSession;
    }

    const index = itemSession.elementSessions.findIndex(es => es.element === elementSession.element);
    if (index === -1) {
        throw new Error(`no element session found for model with element ${elementSession.element}`);
    }
    // merge values (since the update may come from a controller function that doesn't copy all relevant values)
    itemSession.elementSessions[index] = {...itemSession.elementSessions[index], ...elementSession};
    return itemSession;
}

export const pieItemSessionContext = createContext<PieItemSession>("pie-ctx-item-session");
