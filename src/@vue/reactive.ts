import isObj from "./utils/isObj";
import {handles} from "./utils/handles";

const targetMap = new WeakMap()

export function reactive(target) {
    if (!isObj(target)) {
        return target
    }
    if (targetMap.has(target)) {
        return targetMap.get(target)
    }
    const proxyObj = new Proxy(target, handles)
    targetMap.set(target, proxyObj)
    return proxyObj
}