import {TrackType, TriggerType} from "./utils/type/handlesType";

interface EffectOptions {
    readonly lazyEffect: boolean
    readonly scheduler?: (effect: Function) => void
}

const targetMap = new WeakMap()
const ITERATE_KEY = Symbol("iterate")
let activeEffect = undefined
let shouldTrack: boolean = true
const effectStack = []
export const pauseTracking = () => {
    shouldTrack = false
}
export const resumeTracking = () => {
    shouldTrack = true
}
export const cleanup = (effectFn) => {
    const {depArray} = effectFn
    if (!depArray.length) {
        return;
    }
    for (const depArrayElement of depArray) {
        depArrayElement.delete(effectFn)
    }
    depArray.length = 0
}
export const effect = (fn, options: EffectOptions = {lazyEffect: false}) => {
    const effectFn = () => {
        try {
            activeEffect = effectFn
            effectStack.push(activeEffect)
            cleanup(effectFn)
            return fn()
        } finally {
            effectStack.pop()
            activeEffect = effectStack[effectStack.length - 1]
        }
    }
    effectFn.depArray = []
    effectFn.options = options
    if (!options.lazyEffect) {
        effectFn()
    }
    return effectFn
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
        activeEffect.depArray.push(depSet)
    }
}

export function trigger(target, triggerType, key) {
    const effectFns = getEffects(target, triggerType, key)
    if (!effectFns) {
        return
    }
    for (const effectFn of effectFns) {
        if (effectFn === activeEffect) {
            continue;
        }
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
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