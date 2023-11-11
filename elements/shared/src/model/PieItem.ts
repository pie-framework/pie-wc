import {SemVer} from "./Version.js";
import {createContext} from "@lit/context";

export interface BaseEntity {
    id?: string;
}

export interface SearchMetaData {
    [key: string]: unknown;
}

export interface SearchMetaDataEntity extends BaseEntity {
    searchMetaData?: SearchMetaData;
}

export interface ConfigElements {
    [key: string]: string;
}

export interface PieModel {
    id: string;

    element: string;

    [key: string]: unknown;
}

export interface ConfigEntity {
    id: string;
    markup: string;
    elements: ConfigElements;
    models: PieModel[];

    [key: string]: unknown; // allow additional properties;
}

export interface ConfigContainerEntity extends BaseEntity {
    config: ConfigEntity;
}

export interface VersionEntity extends BaseEntity {
    baseId: string;
    signature?: string;
    version: SemVer;
}

export interface PiePassage extends VersionEntity, ConfigContainerEntity, SearchMetaDataEntity {
    name: string;
    retired?: boolean;
    published?: boolean;
}

export interface PieItem extends VersionEntity, ConfigContainerEntity, SearchMetaDataEntity {
    name?: string;
    passage?: string | PiePassage;
    retired?: boolean;
    published?: boolean;
}

/**
 * Relationship between a pie element and the HTML element it is mapped to as defined in a PIE item.
 */
export class PieElementMapping {
    /**
     * The pie element to load. For instance: @pie-element/multiple-choice@latest
     * or @pie-element/multiple-choice@7.16.0
     */
    pie: string;

    /**
     * What the element should be mapped to according to the item info, e.g. pp-pie-element-multiple-choice. This
     * is needed because these elements are used in the item's markup. It can be read from the config node
     * 'elements', which is a map between elements as they are used in the markup and the pie element they
     * refer to, for instance:
     *
     *     "elements": {
     *       "pp-pie-element-multiple-choice": "@pie-element/multiple-choice@latest"
     *     }
     */
    pieTagName: string;

    /**
     * The actual element name that the pie element is mapped to. This is the name that is used in the markup that
     * will be merged into the host. We need this to iron out the wrinkles associated with otherwise having mapped
     * the same component to multiple HTML elements. It is regrettable that PIE provides the option to map to
     * arbitrary HTML elements; this is a workaround for that. The loader is responsible for setting this.
     */
    tagName: string;

    /**
     * The parsed pie package name, path and version.
     */
    piePackage: { name: string; path: string; version: string };

    /**
     * Constructor.
     * @param pie The pie element to load, e.g. @pie-element/multiple-choice@7.16.0
     * @param targetElement The HTML element name to map the pie element to
     */
    constructor(pie: string, targetElement: string) {
        this.pie = pie;
        this.pieTagName = targetElement;
        this.piePackage = parsePackageName(pie);
    }
}

/**
 * Parse npm package name and return base name, path and version in an object.
 */
export const parsePackageName = (
    input: string,
    versionFallback: string = ''
): { name: string; path: string; version: string } => {
    if (!input) {
        throw new Error('Parameter is required: input');
    }
    const matched =
        input.charAt(0) === '@'
            ? input.match(/^(@[^/]+\/[^/@]+)(?:\/([^@]+))?(?:@([\s\S]+))?/) // scoped package name regex
            : input.match(/^([^/@]+)(?:\/([^@]+))?(?:@([\s\S]+))?/); // normal package name
    if (!matched) {
        throw new Error(`[parse-package-name] "${input}" is not a valid string`);
    }
    return {
        name: matched[1],
        path: matched[2] || '',
        version: matched[3] || versionFallback,
    };
};

export const pieItemContext = createContext<PieItem>("pie-ctx-item");

export const piePassageContext = createContext<PiePassage>("pie-ctx-passage");

export const pieModelContext = createContext<PieModel>("pie-ctx-model");
