import {reactive} from "./@vue/reactive";

const array = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const status = reactive(array)

status.pop()
console.log(status)