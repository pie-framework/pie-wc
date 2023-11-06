import { Feedback } from './Feedback.js';

export interface Choice {
  /** Indicates if the choice is correct */
  correct?: boolean;

  /** the value that will be stored if this choice is selected */
  value: string;

  /** the text label that will be presented to the user for this choice */
  label: string;

  /** student feedback for this choice, only shown in evaluate mode */
  feedback?: Feedback;

  /** Rationale for the Choice */
  rationale?: string;
}
