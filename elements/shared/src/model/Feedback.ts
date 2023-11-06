/**
 * The type of feedback to use:
 *   `default` = a standard feedback message
 *   `custom` = a customized feedback message
 */

export interface Feedback {
  /** @default default */
  type: 'default' | 'custom' | 'none';

  /** Value for feedback */
  value?: string;

  /** Custom value for feedback */
  custom?: string;
}

export interface DefaultFeedbackType {
  /** Indicates the feedback type */
  type: 'default' | 'none';

  /** Indicates the feedback value */
  default?: string;
}

interface CustomFeedbackType {
  /** Indicates the feedback type */
  type: 'custom';

  /** Indicates the feedback custom value */
  custom: string;
}

type FeedbackType = CustomFeedbackType | DefaultFeedbackType;

export interface ComplexFeedbackType {
  /** Indicates the configuration for feedback when answer is correct */
  correct: FeedbackType;

  /** Indicates the configuration for feedback when answer is incorrect */
  incorrect: FeedbackType;

  /** Indicates the configuration for feedback when answer is partially correct */
  partial?: FeedbackType;
}
