/**
 * Config panel settings that are shared across many PIEs
 */
export interface CommonConfigSettings {
  /**
   * Indicates the dimensions configuration for the authoring container
   * Note: Some items have a default minimum width because of their content, but if
   * the minWidth is lower than this, the overflow behavior will take care of that
   * @default: {}
   */
  contentDimensions?: {
    /**
     * Indicates the max height of the authoring container
     * @default undefined
     */
    maxHeight?: number | string;

    /**
     * Indicates the max width of the authoring container
     * @default undefined
     */
    maxWidth?: number | string;

    /**
     * Indicates the min height of the authoring container
     * @default undefined
     */
    minHeight?: number | string;

    /**
     * Indicates the min width of the authoring container
     * @default undefined
     */
    minWidth?: number | string;
  };

  /**
   * Indicates whether the settings panel wil allow the author to modify settings for partial scoring
   * @default true
   */
  settingsPartialScoring?: boolean;
}
