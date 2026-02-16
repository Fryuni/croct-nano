import type { JsonValue } from '@croct/json';
import type { ExternalTrackingEventPayload } from '@croct/plug/sdk/tracking';
import type { ReadableAtom } from 'nanostores';
import type { UnbindFn } from './common.js';
import { croct } from './common.js';

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
function accumulateAndSendValue<T>(
    sendFn: (value: T) => void,
): (atom: ReadableAtom<T>, ignoreValue?: T) => UnbindFn {
    let pendingValue: T | undefined;
    let pendingTimer: ReturnType<typeof setTimeout> | undefined;
    const send = () => {
        const value = pendingValue;
        pendingValue = undefined;

        if (value !== undefined) {
            sendFn(value);
        }
    };

    return (atom, ignoreValue) =>
        atom.subscribe(value => {
            if (ignoreValue !== undefined && value === ignoreValue) return;

            pendingValue = value;
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

type CartPayload = ExternalTrackingEventPayload<'cartModified'>['cart'];

/*#__PURE__*/
const sendCart = accumulateAndSendValue<CartPayload | null>(cart => {
    if (cart === null) {
        return;
    }

    croct.track('cartModified', { cart });
});

/*#__PURE__*/
export const trackCart = (atom: ReadableAtom<CartPayload | null>): UnbindFn => sendCart(atom, null);
