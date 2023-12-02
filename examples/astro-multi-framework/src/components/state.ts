import {persistentAtom} from "@nanostores/persistent";
import {type WritableAtom} from "nanostores";
import {action} from "nanostores";
import {logger} from "@nanostores/logger";

export const $counter = persistentAtom<number>('counter', 0, {
    listen: true,
    encode: value => value.toString(),
    decode: value => {
        const number = parseInt(value, 10);
        if (!Number.isSafeInteger(number)) {
            return 0;
        }
        return number;
    }
});

// For Svelte
export const counter = $counter;

export const delta = action($counter, 'delta', (store: WritableAtom<number>, value: number) => {
    store.set(store.get() + value);
});

export const reset = action($counter, 'reset', (store: WritableAtom<number>) => {
    store.set(0);
});
