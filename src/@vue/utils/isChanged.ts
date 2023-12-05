export default function isChanged(oldValue, newValue): boolean {
    return Object.is(oldValue, newValue)
}