import { Rectangle } from './Rectangle.js';
import { Polygon } from './Polygon.js';

export interface Shape {
  /** the rectangles of the shape */
  rectangles: Rectangle[];
  /** the polygons of the shape */
  polygons: Polygon[];
}
