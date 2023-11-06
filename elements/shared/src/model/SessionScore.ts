import {createContext} from "@lit/context";

export enum ScoreType {
    AUTO = 'auto',
    MANUAL = 'manual',
}

export interface SessionScore {
    points?: number;
    max?: number;
    type?: ScoreType;
    partialScoring?: boolean;
    message?: string;
    errors?: string[];
}

export interface SessionAutoScore extends SessionScore {
    elements?: any[];
    partialScoring?: boolean;
}

export interface SessionManualScore extends SessionScore {
}

export const pieSessionAutoScoreContext = createContext<SessionAutoScore>("pie-ctx-session-auto-score");
