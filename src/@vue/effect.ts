import {TrackType} from "./utils/type/handlesType";

let shouldTrack: boolean = true
export const pauseTracking = () => {
    shouldTrack = false
}
export const resumeTracking = () => {
    shouldTrack = true
}

export function track(target, trackType, key) {
    if (!shouldTrack) {
        return;
    }
    if (trackType === TrackType.ITERATE) {
        console.log(trackType + "依赖收集")
        return
    }
    console.log(trackType + "依赖收集" + key)
}

export function trigger(target, triggerType, key) {
    console.log(triggerType + "派发更新" + key)
}