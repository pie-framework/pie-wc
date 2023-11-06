import { Point } from './Point.js';

export interface Polygon {
  /** the id of the polygon */
  id?: string;
  /** indicates if the polygon is correct */
  correct?: boolean;
  /** the points of the polygon */
  points: Point[];
}
