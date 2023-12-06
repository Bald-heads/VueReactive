import {track, trigger} from "./effect";
import {TrackType, TriggerType} from "./utils/type/handlesType";

export function ref(value) {
    return {
        get value() {
            track(this, TrackType.GET, "value")
            return value
        },
        set value(newValue) {
            value = newValue
            trigger(this, TriggerType.SET, "value")
        }
    }
}