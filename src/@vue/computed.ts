import {effect, track, trigger} from "./effect";
import {TrackType, TriggerType} from "./utils/type/handlesType";

function normalizeParameters(getterOrOptions) {
    let getter, setter
    if (typeof getterOrOptions === "function") {
        getter = getterOrOptions
        setter = () => {
            console.warn(`Computed property was assigned to but it has no setter`)
        }
    } else {
        getter = getterOrOptions.getter
        setter = getterOrOptions.setter
    }
    return {
        getter, setter
    }
}

export function computed(getterOrOptions) {
    const {getter, setter} = normalizeParameters(getterOrOptions)
    let value, dirty = true
    const effectFn = effect(getter, {
        lazyEffect: true,
        scheduler: () => {
            dirty = true
            trigger(computedObject, TriggerType.SET, "value")
        }
    })
    const computedObject = {
        get value() {
            track(computedObject, TrackType.GET, "value")
            if (dirty) {
                value = effectFn()
                dirty = false
            }
            return value
        },
        set value(newValue) {
            setter(newValue)
        }
    }
    return computedObject
}