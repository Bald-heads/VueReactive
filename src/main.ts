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

effect(f1)
status.a = 3