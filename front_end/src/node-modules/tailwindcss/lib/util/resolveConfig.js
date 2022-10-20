"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: ()=>resolveConfig
});
const _negateValue = /*#__PURE__*/ _interopRequireDefault(require("./negateValue"));
const _corePluginList = /*#__PURE__*/ _interopRequireDefault(require("../corePluginList"));
const _configurePlugins = /*#__PURE__*/ _interopRequireDefault(require("./configurePlugins"));
const _defaultConfigStub = /*#__PURE__*/ _interopRequireDefault(require("../../stubs/defaultConfig.stub"));
const _colors = /*#__PURE__*/ _interopRequireDefault(require("../public/colors"));
const _defaults = require("./defaults");
const _toPath = require("./toPath");
const _normalizeConfig = require("./normalizeConfig");
const _isPlainObject = /*#__PURE__*/ _interopRequireDefault(require("./isPlainObject"));
const _cloneDeep = require("./cloneDeep");
const _pluginUtils = require("./pluginUtils");
const _withAlphaVariable = require("./withAlphaVariable");
const _toColorValue = /*#__PURE__*/ _interopRequireDefault(require("./toColorValue"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function isFunction(input) {
    return typeof input === "function";
}
function isObject(input) {
    return typeof input === "object" && input !== null;
}
function mergeWith(target, ...sources) {
    let customizer = sources.pop();
    for (let source of sources){
        for(let k in source){
            let merged = customizer(target[k], source[k]);
            if (merged === undefined) {
                if (isObject(target[k]) && isObject(source[k])) {
                    target[k] = mergeWith({}, target[k], source[k], customizer);
                } else {
                    target[k] = source[k];
                }
            } else {
                target[k] = merged;
            }
        }
    }
    return target;
}
const configUtils = {
    colors: _colors.default,
    negative (scale) {
        // TODO: Log that this function isn't really needed anymore?
        return Object.keys(scale).filter((key)=>scale[key] !== "0").reduce((negativeScale, key)=>{
            let negativeValue = (0, _negateValue.default)(scale[key]);
            if (negativeValue !== undefined) {
                negativeScale[`-${key}`] = negativeValue;
            }
            return negativeScale;
        }, {});
    },
    breakpoints (screens) {
        return Object.keys(screens).filter((key)=>typeof screens[key] === "string").reduce((breakpoints, key)=>({
                ...breakpoints,
                [`screen-${key}`]: screens[key]
            }), {});
    }
};
function value(valueToResolve, ...args) {
    return isFunction(valueToResolve) ? valueToResolve(...args) : valueToResolve;
}
function collectExtends(items) {
    return items.reduce((merged, { extend  })=>{
        return mergeWith(merged, extend, (mergedValue, extendValue)=>{
            if (mergedValue === undefined) {
                return [
                    extendValue
                ];
            }
            if (Array.isArray(mergedValue)) {
                return [
                    extendValue,
                    ...mergedValue
                ];
            }
            return [
                extendValue,
                mergedValue
            ];
        });
    }, {});
}
function mergeThemes(themes) {
    return {
        ...themes.reduce((merged, theme)=>(0, _defaults.defaults)(merged, theme), {}),
        // In order to resolve n config objects, we combine all of their `extend` properties
        // into arrays instead of objects so they aren't overridden.
        extend: collectExtends(themes)
    };
}
function mergeExtensionCustomizer(merged, value) {
    // When we have an array of objects, we do want to merge it
    if (Array.isArray(merged) && isObject(merged[0])) {
        return merged.concat(value);
    }
    // When the incoming value is an array, and the existing config is an object, prepend the existing object
    if (Array.isArray(value) && isObject(value[0]) && isObject(merged)) {
        return [
            merged,
            ...value
        ];
    }
    // Override arrays (for example for font-families, box-shadows, ...)
    if (Array.isArray(value)) {
        return value;
    }
    // Execute default behaviour
    return undefined;
}
function mergeExtensions({ extend , ...theme }) {
    return mergeWith(theme, extend, (themeValue, extensions)=>{
        // The `extend` property is an array, so we need to check if it contains any functions
        if (!isFunction(themeValue) && !extensions.some(isFunction)) {
            return mergeWith({}, themeValue, ...extensions, mergeExtensionCustomizer);
        }
        return (resolveThemePath, utils)=>mergeWith({}, ...[
                themeValue,
                ...extensions
            ].map((e)=>value(e, resolveThemePath, utils)), mergeExtensionCustomizer);
    });
}
/**
 *
 * @param {string} key
 * @return {Iterable<string[] & {alpha: string | undefined}>}
 */ function* toPaths(key) {
    let path = (0, _toPath.toPath)(key);
    if (path.length === 0) {
        return;
    }
    yield path;
    if (Array.isArray(key)) {
        return;
    }
    let pattern = /^(.*?)\s*\/\s*([^/]+)$/;
    let matches = key.match(pattern);
    if (matches !== null) {
        let [, prefix, alpha] = matches;
        let newPath = (0, _toPath.toPath)(prefix);
        newPath.alpha = alpha;
        yield newPath;
    }
}
function resolveFunctionKeys(object) {
    // theme('colors.red.500 / 0.5') -> ['colors', 'red', '500 / 0', '5]
    const resolvePath = (key, defaultValue)=>{
        for (const path of toPaths(key)){
            let index = 0;
            let val = object;
            while(val !== undefined && val !== null && index < path.length){
                val = val[path[index++]];
                let shouldResolveAsFn = isFunction(val) && (path.alpha === undefined || index <= path.length - 1);
                val = shouldResolveAsFn ? val(resolvePath, configUtils) : val;
            }
            if (val !== undefined) {
                if (path.alpha !== undefined) {
                    let normalized = (0, _pluginUtils.parseColorFormat)(val);
                    return (0, _withAlphaVariable.withAlphaValue)(normalized, path.alpha, (0, _toColorValue.default)(normalized));
                }
                if ((0, _isPlainObject.default)(val)) {
                    return (0, _cloneDeep.cloneDeep)(val);
                }
                return val;
            }
        }
        return defaultValue;
    };
    Object.assign(resolvePath, {
        theme: resolvePath,
        ...configUtils
    });
    return Object.keys(object).reduce((resolved, key)=>{
        resolved[key] = isFunction(object[key]) ? object[key](resolvePath, configUtils) : object[key];
        return resolved;
    }, {});
}
function extractPluginConfigs(configs) {
    let allConfigs = [];
    configs.forEach((config)=>{
        allConfigs = [
            ...allConfigs,
            config
        ];
        var ref;
        const plugins = (ref = config === null || config === void 0 ? void 0 : config.plugins) !== null && ref !== void 0 ? ref : [];
        if (plugins.length === 0) {
            return;
        }
        plugins.forEach((plugin)=>{
            if (plugin.__isOptionsFunction) {
                plugin = plugin();
            }
            var ref;
            allConfigs = [
                ...allConfigs,
                ...extractPluginConfigs([
                    (ref = plugin === null || plugin === void 0 ? void 0 : plugin.config) !== null && ref !== void 0 ? ref : {}
                ])
            ];
        });
    });
    return allConfigs;
}
function resolveCorePlugins(corePluginConfigs) {
    const result = [
        ...corePluginConfigs
    ].reduceRight((resolved, corePluginConfig)=>{
        if (isFunction(corePluginConfig)) {
            return corePluginConfig({
                corePlugins: resolved
            });
        }
        return (0, _configurePlugins.default)(corePluginConfig, resolved);
    }, _corePluginList.default);
    return result;
}
function resolvePluginLists(pluginLists) {
    const result = [
        ...pluginLists
    ].reduceRight((resolved, pluginList)=>{
        return [
            ...resolved,
            ...pluginList
        ];
    }, []);
    return result;
}
function resolveConfig(configs) {
    let allConfigs = [
        ...extractPluginConfigs(configs),
        {
            prefix: "",
            important: false,
            separator: ":",
            variantOrder: _defaultConfigStub.default.variantOrder
        }
    ];
    var ref, ref1;
    return (0, _normalizeConfig.normalizeConfig)((0, _defaults.defaults)({
        theme: resolveFunctionKeys(mergeExtensions(mergeThemes(allConfigs.map((t)=>{
            return (ref = t === null || t === void 0 ? void 0 : t.theme) !== null && ref !== void 0 ? ref : {};
        })))),
        corePlugins: resolveCorePlugins(allConfigs.map((c)=>c.corePlugins)),
        plugins: resolvePluginLists(configs.map((c)=>{
            return (ref1 = c === null || c === void 0 ? void 0 : c.plugins) !== null && ref1 !== void 0 ? ref1 : [];
        }))
    }, ...allConfigs));
}
