import croct from '@croct/plug';
import type { JsonValue } from '@croct/json';
import type { ReadableAtom } from 'nanostores';
import type { UnbindFn } from './common.js';

/*#__PURE__*/
function accumulateAndSend(
    sendFn: (pairs: [string, JsonValue][]) => void,
): (path: string, atom: ReadableAtom<JsonValue>, ignoreValue?: JsonValue) => UnbindFn {
    const pendingPairs = new Map<string, JsonValue>();
    let pendingTimer: ReturnType<typeof setTimeout> | undefined;
    const send = () => {
        const entries = Array.from(pendingPairs.entries());
        pendingPairs.clear();
        sendFn(entries);
    };
    return (path, atom, ignoreValue) =>
        atom.subscribe(value => {
            if (ignoreValue !== undefined && value === ignoreValue) return;
            // Cast to remove the read-only marker.
            pendingPairs.set(path, value as JsonValue);
            clearTimeout(pendingTimer);
            pendingTimer = setTimeout(send);
        });
}

/*#__PURE__*/
export const trackSessionField = accumulateAndSend(pairs => {
    const patch = croct.session.edit();
    for (const [path, value] of pairs) {
        patch.set(path, value);
    }
    patch.save();
});

/*#__PURE__*/
export const trackUserField = accumulateAndSend(pairs => {
    const patch = croct.user.edit();
    for (const [path, value] of pairs) {
        patch.set(path, value);
    }
    patch.save();
});
