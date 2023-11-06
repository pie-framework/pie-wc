import {createContext} from "@lit/context";

export enum ModeType {
    GATHER = 'gather',
    VIEW = 'view',
    EVALUATE = 'evaluate',
}

export enum RoleType {
    INSTRUCTOR = 'instructor',
    STUDENT = 'student',
}

export interface Env {
    mode: ModeType;
    role: RoleType;
    partialScoring?: boolean;
    [key: string]: any;
}

export const pieEnvContext = createContext<Env>("pie-ctx-env");
