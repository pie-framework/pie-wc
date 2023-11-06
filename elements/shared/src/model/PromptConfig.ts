/**
 * Shared properties of configure views for interactions that support optional prompts
 */
export interface PromptConfig {
  /**
   * Determines whether prompt field will be displayed or not
   * @default true
   */
  showPrompt?: boolean;

  /**
   * The label for the item stem/prompt field
   * @default "Item Stemm"
   * @TJS-examples ["Question Prompt", "Item Stem"]
   */
  promptLabel?: string;
}
