import {reactive} from "./@vue/reactive";
import {effect} from "./@vue/effect";

const obj = {
    a: 1,
    b: 2,
    c: 4
}
const status = reactive(obj)

function f1() {
    console.log("f1")
    status.a
}

const effectFn = effect(f1, {
    lazyEffect: false,
    scheduler: (effect) => {
        effect()
    }
})

effectFn()
status.a = 10
status.a = 10
status.a = 10
status.a = 10
status.a = 10
status.a = 10





