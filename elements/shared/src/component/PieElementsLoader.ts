import {PieItem} from "../model/index.js";
import {PieElementsMeta} from "./shared.js";

/**
 * Load the elements and controllers for the given item.
 *
 * The loader is responsible for loading the element(s) and controller for an item and make the appropriate
 * custom HTML element available to the host component. After doing that, it loads the controller functions
 * and returns a map from PIE to controller functions.
 */
export interface PieElementsLoaderFn {
    (item: PieItem): Promise<PieElementsMeta>
}
