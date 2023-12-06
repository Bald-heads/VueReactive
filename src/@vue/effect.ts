import {TrackType, TriggerType} from "./utils/type/handlesType";

const targetMap = new WeakMap()
const ITERATE_KEY = Symbol("iterate")
let activeEffect = undefined
let shouldTrack: boolean = true
export const pauseTracking = () => {
    shouldTrack = false
}
export const resumeTracking = () => {
    shouldTrack = true
}
export const effect = (fn) => {
    const effectFn = () => {
        try {
            activeEffect = effectFn
            return fn()
        } finally {
            activeEffect = null
        }
    }
    effectFn()
}

export function track(target, trackType, key) {
    if (!shouldTrack || !activeEffect) {
        return;
    }
    let propMap = targetMap.get(target)
    if (!propMap) {
        propMap = new Map()
        targetMap.set(target, propMap)
    }
    if (trackType === TrackType.ITERATE) {
        key = ITERATE_KEY
    }
    let typeMap = propMap.get(key)
    if (!typeMap) {
        typeMap = new Map()
        propMap.set(key, typeMap)
    }
    let depSet = typeMap.get(trackType)
    if (!depSet) {
        depSet = new Set()
        typeMap.set(trackType, depSet)
    }
    if (!depSet.has(activeEffect)) {
        depSet.add(activeEffect)
    }
}

export function trigger(target, triggerType, key) {
    const effectFns = getEffects(target, triggerType, key)
    for (const effectFn of effectFns) {
        effectFn()
    }
}

function getEffects(target, triggerType, key) {
    const propMap = targetMap.get(target)
    if (!propMap) {
        return;
    }
    const keys = [key]
    if (triggerType === TriggerType.ADD || triggerType === TriggerType.DELETE) {
        keys.push(ITERATE_KEY)
    }
    const effectFns = new Set()
    const triggerTypeMap = {
        [TriggerType.SET]: [TrackType.GET],
        [TriggerType.ADD]: [TrackType.GET, TrackType.HAS, TrackType.ITERATE],
        [TriggerType.DELETE]: [TrackType.GET, TrackType.HAS, TrackType.ITERATE]
    }
    for (const k of keys) {
        const typeMap = propMap.get(k)
        if (!typeMap) {
            continue;
        }
        const trackTypes = triggerTypeMap[triggerType]
        for (const trackType of trackTypes) {
            const dep = typeMap.get(trackType)
            if (!dep) {
                continue;
            }
            for (const effectFn of dep) {
                effectFns.add(effectFn)
            }
        }
    }
    return effectFns
}