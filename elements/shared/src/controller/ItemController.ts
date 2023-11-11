import {ConfigEntity, Env, ModeType, PieItem, PieItemSession, ScoreType, SessionAutoScore} from "../model/index.js";
import {OutcomeResult} from "./ElementController.js";
import {PieElementsMeta} from "../component/index.js";

/**
 * Returns true if partial scoring is disabled for all models in the config.
 * Requires that all elements have the flag set to `false` to have partial scoring disabled.
 * @param config
 */
export const isPartialScoringDisabled = (config: ConfigEntity): boolean => {
    if (!config?.models || !config?.models.length) {
        return false;
    }
    const partialScoring = config.models.map((m) => m.partialScoring);
    const filtered = partialScoring.filter((ps) => ps !== false);
    return filtered.length === 0;
}

/**
 * Returns true if the config contains a rubric.
 * @param config
 */
export const isRubric = (config: ConfigEntity): boolean => {
    if (config?.rubric) {
        return true;
    }
    if (Array.isArray(config?.models)) {
        /**
         * The element name should contain the 'rubric' keyword.
         * Alternatively, we can look up the key for the value '@pie-element/rubric' in the elements map.
         */
        return config.models.some((m) => m.element.includes('rubric'));
    }
}

/**
 * If the score array only has 1 score, then use the 'max' from that score.
 * Otherwise, normalize the score such that max will always be 1.
 * This is to accommodate custom elements that return a max greater than 1.
 * @param raw
 * @param env
 */
export const formatAutoScore = (raw: OutcomeResult[], env: Env): SessionAutoScore => {
    const scores = raw.filter((s) => s.hasOwnProperty('score'));

    if (scores.length === 1) {
        return {
            max: scores[0].max ?? 1,
            points: scores[0].score,
            partialScoring: env.partialScoring,
            type: ScoreType.AUTO,
        };
    }

    let points: number = 0;
    if (scores.length) {
        points = scores.reduce((acc, s) => {
            return acc + (s.score ?? 0) / (s.max ?? 1);
        }, 0);
        points = points / scores.length;
    }

    return {
        max: 1,
        points: env.partialScoring ? points : points === 1 ? 1 : 0,
        partialScoring: env.partialScoring,
        type: ScoreType.AUTO,
    };
}

export const autoScoreSession = async (host: HTMLElement,
                                       session: PieItemSession,
                                       item: PieItem,
                                       environment: Env,
                                       pieMeta: PieElementsMeta): Promise<SessionAutoScore> => {

    if (!session) {
        console.debug('session is required');
        return null;
    }
    if (!item) {
        console.debug('item is required');
        return null;
    }
    if (!environment) {
        console.debug('environment is required');
        return null;
    }
    if (!pieMeta) {
        console.debug('fns is required');
        return null;
    }
    console.debug('auto-scoring session: %O, item: %O, env: %O, meta: %O', session, item, environment, pieMeta);
    const env = {...environment};
    env.mode = ModeType.EVALUATE; // force mode to evaluate, since some elements won't return an outcome;
    const isScoringDisabled = isPartialScoringDisabled(item.config);
    if (isScoringDisabled) {
        console.debug('partial scoring explicitly disabled for item: %O', item);
        env.partialScoring = false;
    }

    const outcomes = await Promise.all(session.elementSessions.map((elementSession) => {
        const fns = pieMeta.loaded.find((meta) => meta.elementMapping.pieTagName === elementSession.element)?.controllerFns;
        if (!fns?.outcome) {
            throw new Error(`no outcome function found for pie ${elementSession.pie}`);
        }
        const model = item.config.models.find((m) => m.element === elementSession.element);
        if (!model) {
            throw new Error(`no model found for element session ${elementSession} (looking for model with element ${elementSession.element})`);
        }
        return fns.outcome(host, model, elementSession, env);
    }));

    const errors = outcomes.filter((s) => s.error).map((s) => s.error);
    if (errors.length) {
        return <SessionAutoScore>{
            errors: errors,
            message: `auto-score error: ${errors.join(', ')}`,
        };
    }
    return formatAutoScore(outcomes, env);
}
