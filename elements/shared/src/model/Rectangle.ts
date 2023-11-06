export interface Rectangle {
  /** the id of the rectangle */
  id?: string;
  /** indicates if the rectangle is correct */
  correct?: boolean;
  /** the height of the rectangle */
  height: number;
  /** the width of the rectangle */
  width: number;
  /** the x position of the rectangle */
  x: number;
  /** the y position of the rectangle */
  y: number;
}
