import {get, shuffle, isEmpty, isNull, isUndefined, isBoolean} from 'lodash';
import {Choice, Env} from "../model/index.js";

export const compact = (arr) => {
    if (Array.isArray(arr)) {
        return arr.filter((v) => !isNull(v) && !isUndefined(v));
    }
    return arr;
};

// TODO use more typing, including session
export const getShuffledChoices = (choices: Choice[], session, updateSession, choiceKey): Promise<Choice[]> =>
    new Promise((resolve) => {
        console.log('updateSession type: ', typeof updateSession);
        console.log('session: ', session);

        const currentShuffled = compact((session || {}).shuffledValues);

        if (!session) {
            // eslint-disable-next-line quotes
            console.warn("unable to save shuffled choices because there's no session.");
            resolve(undefined);
        } else if (!isEmpty(currentShuffled)) {
            console.debug('use shuffledValues to sort the choices...', session.shuffledValues);
            resolve(compact(currentShuffled.map((v) => choices.find((c) => c[choiceKey] === v))));
        } else {
            const shuffledChoices = shuffle(choices);

            if (updateSession && typeof updateSession === 'function') {
                try {
                    //Note: session.id refers to the id of the element within a session
                    const shuffledValues = compact(shuffledChoices.map((c) => c[choiceKey]));
                    console.log('try to save shuffledValues to session...', shuffledValues);
                    console.log('call updateSession... ', session.id, session.element);
                    if (isEmpty(shuffledValues)) {
                        console.error(
                            `shuffledValues is an empty array? - refusing to call updateSession: shuffledChoices: ${JSON.stringify(
                                shuffledChoices,
                            )}, key: ${choiceKey}`,
                        );
                    } else {
                        updateSession(session.id, session.element, {shuffledValues}).catch((e) =>
                            // eslint-disable-next-line no-console
                            console.error('update session failed for: ', session.id, e),
                        );
                    }
                } catch (e) {
                    console.warn('unable to save shuffled order for choices');
                    console.error(e);
                }
            } else {
                console.warn('unable to save shuffled choices, shuffle will happen every time.');
            }
            //save this shuffle to the session for later retrieval
            resolve(shuffledChoices);
        }
    });

/**
 * If we return:
 * - true - that means that the order of the choices will be ordinal (as is created in the configure item)
 * - false - that means the getShuffledChoices above will be called and that in turn means that we either
 * return the shuffled values on the session (if any exists) or we shuffle the choices
 * @param model - model to check if we should lock order
 * @param session - session to check if we should lock order
 * @param env - env to check if we should lock order
 * @returns {boolean}
 */
// TODO use more typing
export const lockChoices = (model, session, env) => {
    if (model.lockChoiceOrder) {
        return true;
    }

    console.log('lockChoiceOrder: ', get(env, ['@pie-element', 'lockChoiceOrder'], false));

    if (get(env, ['@pie-element', 'lockChoiceOrder'], false)) {
        return true;
    }

    const role = get(env, 'role', 'student');

    if (role === 'instructor') {
        // TODO: .. in the future the instructor can toggle between ordinal and shuffled here, so keeping this code until then
        /*const alreadyShuffled = hasShuffledValues(session);

        if (alreadyShuffled) {
          return false;
        }

        return true;*/
        return true;
    }

    // here it's a student, so don't lock; it will shuffle if it needs to
    return false;
};

// TODO use more typing
export const isPartialScoringEnabled = (config: any, env: Env, defaultValue?: boolean) => {
    // if model.partialScoring = false
    //  - if env.partialScoring = false || env.partialScoring = true => use dichotomous scoring
    // else if model.partialScoring = true || undefined
    //  - if env.partialScoring = false, use dichotomous scoring
    //  - else if env.partialScoring = true, use partial scoring
    config = config || {};
    env = env || {} as Env;

    if (config.partialScoring === false) {
        return false;
    }

    if (env.partialScoring === false) {
        return false;
    }

    return isBoolean(defaultValue) ? defaultValue : true;
};
