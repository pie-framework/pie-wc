import {PieElementsLoaderFn} from "./PieElementsLoader.js";
import {PieControllerFns, PieToControllerFns, withMergedModel} from "../controller/index.js";
import {PieElementMapping} from "../model/index.js";

const packageToProjectName = (packageName: string): string => {
    const parts = packageName.split('/');
    const name = parts[parts.length - 1];
    return name.replace(/@pie-element\//, '');
}

/**
 * Loader that is useful for local testing. It loads the elements from the local file system.
 */
export const localPieElementsLoader: PieElementsLoaderFn = async (pies: PieElementMapping[]): Promise<PieToControllerFns> => {
    const originalDefine = customElements.define;
    const defineProxy = new Proxy(originalDefine, {
        apply: function (target, thisArg, argumentsList) {
            // const [name] = argumentsList;
            // const existing = customElements.get(name);
            // if (existing) {
            //     console.log(`blocked registration of ${name} because it already exists`);
            //     // return;
            // }
            return Reflect.apply(target, thisArg, argumentsList);
        }
    });
    try {
        customElements.define = defineProxy;
        // Replace the original define method with the proxy
        const fns = new PieToControllerFns();
        for await (const pieElementMapping of pies) {
            const projectBaseName = packageToProjectName(pieElementMapping.piePackage.name);
            await loadCustomElements(projectBaseName, pieElementMapping);
            fns.add(pieElementMapping, await loadControllerFns(projectBaseName, pieElementMapping));
        }
        return fns;
    } finally {
        // Restore the original define method
        customElements.define = originalDefine;
    }
}

export const loadControllerFns = async (project: string, pieElementMapping: PieElementMapping): Promise<PieControllerFns> => {
    let importLocation = `../../../${project}-controller/dist/index.js`;
    const module = await import(/* @vite-ignore */importLocation);
    if (!module) {
        throw new Error(`no module found for ${pieElementMapping.pie} (at ${importLocation})`);
    }
    if (!module.model) {
        throw new Error(`no model found for ${pieElementMapping.pie} (at ${importLocation})`);
    }
    if (!module.outcome) {
        throw new Error(`no controller found for ${pieElementMapping.pie} (at ${importLocation})`);
    }
    return {
        model: withMergedModel(module.model),
        outcome: module.outcome
    };
}

export const loadCustomElements = async (project: string, pie: PieElementMapping) => {
    let importLocation = `../../../${project}-question/dist/index.js`;
    const module = await import(/* @vite-ignore */importLocation);
    if (!module) {
        throw new Error(`no module found for ${pie.pie} (at ${importLocation})`);
    }
    if (!module.default) {
        throw new Error(`no default export found for ${pie.pie} (at ${importLocation})`);
    }
    const OriginalElement = module.default;
    // customElements doesn't allow to define the same constructor multiple times, so create
    // custom class that extends the original element to circumvent this
    customElements.define(pie.targetElement, class extends OriginalElement {
    });
    console.info('defined pie %s as element %s', pie.pie, pie.targetElement);
}
