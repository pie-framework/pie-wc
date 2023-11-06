import {isEmpty, isEqual} from 'lodash';
import {
    Choice,
    ControllerModelFn,
    ControllerOutcomeFn, Env,
    getShuffledChoices,
    isPartialScoringEnabled,
    lockChoices,
    OutcomeResult
} from "@pie-wc/shared";
import {MultipleChoicePie, MultipleChoicePieSession} from "@pie-wc/multiple-choice-model";

export const defaults = {
    promptEnabled: true,
    rationaleEnabled: true,
    accessibilityLabelsEnabled: false,
    teacherInstructionsEnabled: true,
    studentInstructionsEnabled: true,
    choicePrefix: 'letters',
    choicesLayout: 'vertical',
    gridColumns: '2',
};

export const model: ControllerModelFn<MultipleChoicePie, MultipleChoicePieSession> =
    async (model, session, env, updateSession): Promise<MultipleChoicePie> => {
        const normalizedQuestion = normalize(model);

        const defaultFeedback = Object.assign(
            {correct: 'Correct', incorrect: 'Incorrect'},
            normalizedQuestion.defaultFeedback,
        );

        let choices = (normalizedQuestion.choices || []).map(prepareChoice(normalizedQuestion, env, defaultFeedback));
        const lockChoiceOrder = lockChoices(normalizedQuestion, session, env);
        if (!lockChoiceOrder) {
            choices = await getShuffledChoices(choices, session, updateSession, 'value');
        }

        const out: Partial<MultipleChoicePie> = {
            disabled: env.mode !== 'gather',
            mode: env.mode,
            prompt: normalizedQuestion.promptEnabled ? normalizedQuestion.prompt : null,
            choicesLayout: normalizedQuestion.choicesLayout,
            gridColumns: normalizedQuestion.gridColumns,
            choiceMode: normalizedQuestion.choiceMode,
            keyMode: normalizedQuestion.choicePrefix,
            choices,
            responseCorrect: env.mode === 'evaluate' ? isResponseCorrect(normalizedQuestion, session) : undefined,
            language: normalizedQuestion.language,
        };

        const {role, mode} = env || {};
        if (role === 'instructor' && (mode === 'view' || mode === 'evaluate')) {
            out.teacherInstructions = normalizedQuestion.teacherInstructionsEnabled
                ? normalizedQuestion.teacherInstructions
                : null;
        } else {
            out.teacherInstructions = null;
        }

        return out as MultipleChoicePie;
    }

export const outcome: ControllerOutcomeFn<MultipleChoicePie, MultipleChoicePieSession> =
    async (model, session, env): Promise<OutcomeResult> => {
        console.debug('[multiple-choice] outcome %O', {model, session, env});
        if (!session || isEmpty(session)) {
            console.debug('[multiple-choice] no session');
            return {score: 0, empty: true};
        }
        const partialScoringEnabled = isPartialScoringEnabled(model, env) && model.choiceMode !== 'radio';
        const score = getScore(model, session);
        console.debug(`[multiple-choice] score: ${score} (value: ${session.value})`);
        return {score: partialScoringEnabled ? score : score === 1 ? 1 : 0, empty: false};
    }

export const getCorrectResponse = (choices: Choice[]) =>
    choices
        .filter((c) => c.correct)
        .map((c) => c.value)
        .sort();

export const isResponseCorrect = (model: MultipleChoicePie, session) => {
    const correctResponse = getCorrectResponse(model.choices);
    return session && isEqual((session.value || []).sort(), correctResponse);
};

export const parseHTML = (html: string) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
};

const prepareChoice = (model: MultipleChoicePie, env: Env, defaultFeedback) => (choice) => {
    const {role, mode} = env || {};
    const out: any = {
        label: choice.label,
        value: choice.value,
    };

    if (model.accessibilityLabelsEnabled) {
        out.accessibility = parseHTML(choice.accessibility).textContent || choice.value;
    }

    if (role === 'instructor' && (mode === 'view' || mode === 'evaluate')) {
        out.rationale = model.rationaleEnabled ? choice.rationale : null;
    } else {
        out.rationale = null;
    }

    if (mode === 'evaluate') {
        out.correct = !!choice.correct;

        if (model.feedbackEnabled) {
            const feedbackType = (choice.feedback && choice.feedback.type) || 'none';

            if (feedbackType === 'default') {
                out.feedback = defaultFeedback[choice.correct ? 'correct' : 'incorrect'];
            } else if (feedbackType === 'custom') {
                out.feedback = choice.feedback.value;
            }
        }
    }

    return out;
};

export const normalize = (model: MultipleChoicePie): MultipleChoicePie => {
    const {choicesLayout, ...questionProps} = model || {};

    return {
        ...defaults,
        ...questionProps,
        // This is used for offering support for old models which have the property verticalMode
        // Same thing is set in authoring : packages/multiple-choice/configure/src/index.jsx - createDefaultModel
        choicesLayout: (choicesLayout ||
            (model['verticalMode'] === false && 'horizontal') || defaults.choicesLayout) as 'vertical' | 'grid' | 'horizontal',
    } as MultipleChoicePie;
};

export const getScore = (model: MultipleChoicePie, session: MultipleChoicePieSession) => {
    if (!session || isEmpty(session)) {
        return 0;
    }

    const selectedChoices = session.value || [];
    const correctChoices = (model.choices || []).filter((ch) => ch.correct);

    console.debug('[multiple-choice]selected: %O, correct: %O - model: %O', selectedChoices, correctChoices, model);

    let score = selectedChoices.reduce(
        (acc, selectedChoice) => acc +
            (correctChoices.find((ch) => ch.value === selectedChoice) ? 1 : 0),
        0,
    );

    if (correctChoices.length < selectedChoices.length) {
        score -= selectedChoices.length - correctChoices.length;

        if (score < 0) {
            score = 0;
        }
    }

    const str = correctChoices.length ? score / correctChoices.length : 0;

    return parseFloat(str.toFixed(2));
};

