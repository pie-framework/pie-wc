import {PieElementSession} from "./PieElementSession.js";
import {PieItem} from "./PieItem.js";
import {createContext} from "@lit/context";

export interface PieElementSessionReference {
    session: PieElementSession;
    pie: string;
    modelId: string;
}

/**
 * An item session consists of one or more element sessions for the elements and their models in the item.
 */
export interface PieItemSession {
    id: string;
    elementSessions: PieElementSessionReference[];
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
            const session = <PieElementSession>{
                id: crypto.randomUUID(),
                element: element,
            };
            const modelId = model.id;
            return <PieElementSessionReference>{pie, session, modelId};
        })
    };
};


export const pieItemSessionContext = createContext<PieItemSession>("pie-ctx-item-session");
