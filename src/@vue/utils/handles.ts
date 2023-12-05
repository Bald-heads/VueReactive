import {track, trigger, pauseTracking, resumeTracking} from "../effect";
import isObj from "./isObj";
import {reactive} from "../reactive";
import {TrackType, TriggerType} from "./type/handlesType";
import isChanged from "./isChanged";

const arrayInstrumentations = {};
const RAW = Symbol("raw");
["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    arrayInstrumentations[key] = function (...args) {
        const result = Array.prototype[key].apply(this, args)
        if (result < 0 || result === false) {
            return Array.prototype[key].apply(this[RAW], args)
        }
        return result
    }
});
["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    arrayInstrumentations[key] = function (...args) {
        pauseTracking()
        const result = Array.prototype[key].apply(this, args)
        resumeTracking()
        return result
    }
})

export const handles = {
    get(target, key, receiver) {
        if (key === RAW) {
            return target
        }
        track(target, TrackType.GET, key)
        if (arrayInstrumentations.hasOwnProperty(key) && Array.isArray(target)) {
            return arrayInstrumentations[key]
        }
        const result = Reflect.get(target, key, receiver)
        if (isObj(result)) {
            return reactive(result)
        }
        return result
    },
    set(target, key, value, receiver) {
        const type = target.hasOwnProperty(key) ?
            TriggerType.SET : TriggerType.ADD
        const oldLength = Array.isArray(target) ? target.length : undefined
        const result: boolean = Reflect.set(target, key, value, receiver)
        if (!result) {
            return result
        }
        const newLength = Array.isArray(target) ? target.length : undefined
        if (isChanged(target[key], value) || type === TriggerType.ADD) {
            trigger(target, type, key)
            if (Array.isArray(target) && newLength !== oldLength) {
                if (key !== "length") {
                    trigger(target, TriggerType.SET, "length")
                } else {
                    for (let i = newLength; i < oldLength; i++) {
                        trigger(target, TriggerType.DELETE, i.toString())
                    }
                }
            }
        }
        return result
    },
    has(taregt, key) {
        track(taregt, TrackType.HAS, key)
        return Reflect.has(taregt, key)
    },
    ownKeys(target) {
        track(target, TrackType.ITERATE)
        return Reflect.ownKeys(target)
    },
    deleteProperty(target, key) {
        const hasKey = target.hasOwnProperty(key)
        const result = Reflect.deleteProperty(target, key)
        if (hasKey && result) {
            trigger(target, TriggerType.DELETE, key)
        }
        return result
    }
}