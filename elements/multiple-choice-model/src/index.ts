import {
    Choice,
    CommonConfigSettings,
    ConfigureLanguageOptionsProp,
    ConfigureMathMLProp,
    ConfigureProp,
    ConfigurePropWithEnabled,
    PieElementSession,
    PieModel,
    PromptConfig
} from "@pie-wc/shared";

/**
 * Item session for multiple choice PIE element.
 */
export interface MultipleChoicePieSession extends PieElementSession {

    /** The selected choice(s) */
    value: string[];
}

//  NOTE: teacherInstructions, studentInstructions, rationale & scoringType
//  functionalities are not defined yet - the value for those can belong to
//  model or to configuration (to be moved when the functionality is defined)
/**
 * Model for the Choice Interaction.
 */
export interface MultipleChoicePie extends PieModel {
    /** Indicates the choices are single or multiple selection */
    choiceMode?: 'checkbox' | 'radio';

    /** What key should be displayed before choices. If undefined no  key will be displayed.
     * @default: 'letters'
     * */
    choicePrefix?: 'letters' | 'numbers';

    /** The choice options for the question */
    choices: Choice[];

    /**  The question prompt or item stem */
    prompt?: string;

    /** Determines if prompt should show */
    promptEnabled?: boolean;

    /** Indicates the layout of choices for player
     * @default: 'vertical'
     */
    choicesLayout?: 'vertical' | 'grid' | 'horizontal';

    /** Indicates the number of columns for the grid layout
     * @default: 2
     */
    gridColumns?: number;

    /**
     * Indicates the editor's toolbar position which can be 'bottom' or 'top'
     * @default: 'bottom'
     */
    toolbarEditorPosition?: 'bottom' | 'top';

    /**  Indicates the order of choices should be randomly ordered when presented to user */
    lockChoiceOrder?: boolean;

    /** Indicates that the item should use partial scoring */
    partialScoring?: boolean;

    /** Indicates scoring type */
    scoringType?: 'auto' | 'rubric';

    /** Indicates student instructions */
    studentInstructions?: string;

    /** Indicates teacher instructions */
    teacherInstructions?: string;

    /** Indicates if feedback is enabled */
    feedbackEnabled: boolean;

    /** Indicates if Rationale are enabled */
    rationaleEnabled: boolean;

    /** Indicates if spellcheck is enabled for the author. Default value is true */
    spellCheckEnabled: boolean;

    /** Indicates if Student Instructions are enabled */
    studentInstructionsEnabled: boolean;

    /** Indicates if Teacher Instructions are enabled */
    teacherInstructionsEnabled: boolean;

    /** Indicates if Accessibility Labels are enabled */
    accessibilityLabelsEnabled: boolean;

    /** Indicates if Rubric is enabled */
    rubricEnabled: boolean;

    /** Indicates the language of the component
     * Supported options: en, es, en_US, en-US, es_ES, es-ES, es_MX, es-MX
     */
    language?: string;
}

interface ConfigureMaxImageDimensionsProp {
    /** Indicates the max dimension for images in teacher instructions */
    teacherInstructions?: number;

    /** Indicates the max dimension for images in prompt - this is also the default dimension for all other input fields if it's not specified */
    prompt?: number;

    /** Indicates the max dimension for images in rationale */
    rationale?: number;

    /** Indicates the max dimension for images in choices */
    choices?: number;
}

/**
 * Config Object for @pie-elements/multiple-choice
 * @additionalProperties false
 */
export interface MultipleChoiceConfigure extends PromptConfig, CommonConfigSettings {
    /**
     * The number of empty choices to show in config view if no choice model is provided
     * @minimum 1
     * @default 4
     */
    answerChoiceCount?: number;

    /**
     * Configuration for a button that allows an author to add more choices
     */
    addChoiceButton?: ConfigureProp;

    /**
     * Indicates whether the settings panel will allow an author to modify the choice
     * mode (radio / checkboxes) for single or multi-choice questions
     */
    choiceMode?: ConfigureProp;

    /**
     * Indicates whether the settings panel will allow the author to chose prefixes to be prepended to
     * choices, the author may choose `letters`, `numbers` or `none`
     */
    choicePrefix?: ConfigureProp;

    /**
     * Allow choices to be deleted by author
     * @default true
     */
    deleteChoice?: ConfigureProp;

    /**
     * Show fields that allow author to edit content / messages that student role user would see if item
     * is in evaluate mode
     */
    feedback?: ConfigureProp;

    /**
     * Configuration for the prompt
     */
    prompt?: ConfigureProp;

    /**
     * Configuration for the author's spellcheck
     */
    spellCheck?: ConfigureProp;

    /** Indicates the layout of choices for player
     * @default: 'vertical'
     */
    choicesLayout?: ConfigureProp;

    /** Indicates the number of columns for the grid layout
     * @default: 2
     */
    gridColumns?: ConfigureProp;

    /**
     * Indicates whether the settings panel will allow author to control choice shuffling
     */
    lockChoiceOrder?: ConfigureProp;

    /**
     * Indicates whether the settings panel wil allow the author to modify settings for partial scoring
     */
    partialScoring?: ConfigureProp;

    /**
     * Rationale configuration
     */
    rationale?: ConfigureProp;

    /**
     * Scoring Type configuration
     */
    scoringType?: ConfigureProp;

    /**
     * Indicates if the settings panel is not available
     */
    settingsPanelDisabled?: boolean;

    /**
     * Student Instructions configuration
     */
    studentInstructions?: ConfigureProp;

    /**
     * Teacher Instructions configuration
     */
    teacherInstructions?: ConfigureProp;

    /**
     * Indicates if sequential choice labels configuration (currently not used)
     */
    sequentialChoiceLabels?: ConfigurePropWithEnabled;

    /**
     * Accessibility configuration
     */
    accessibility?: ConfigureProp;

    /**
     * Minimum number of answer choices
     */
    minAnswerChoices?: number;

    /**
     * Maximum number of answer choices
     */
    maxAnswerChoices?: number;

    /**
     * Maximum image width for input fields
     */
    maxImageWidth?: ConfigureMaxImageDimensionsProp;

    /**
     * Maximum image height for input fields
     */
    maxImageHeight?: ConfigureMaxImageDimensionsProp;

    /**
     * Rubric configuration - only relevant in environments that use pie-player-components
     */
    withRubric?: ConfigureProp;

    /** Configuration for editable-html */
    mathMlOptions?: ConfigureMathMLProp;

    /**
     * Language configuration
     */
    language?: ConfigurePropWithEnabled;

    /**
     * Language choices configuration
     * Only available if language is enabled
     */
    languageChoices?: {
        label: string;
        options: ConfigureLanguageOptionsProp[];
    };
}

