import croct from '@croct/plug';
import type {FetchOptions, FetchResponse} from '@croct/plug/plug';
import type {JsonObject} from '@croct/plug/sdk/json';
import type {SlotContent, VersionedSlotId} from '@croct/plug/slot';
import {persistentAtom} from '@nanostores/persistent';
import {action, atom, onMount, task, type WritableAtom} from 'nanostores';

const sign = Symbol('croctStore');

export type CroctAtom<P extends JsonObject = JsonObject, I extends VersionedSlotId = string> =
    WritableAtom<FetchResponse<I, P>>
    & {
    refresh: (options?: FetchOptions) => Promise<void>,
    [sign]: {
        slotId: I,
        options?: FetchOptions,
    },
};

export function croctContent<P extends JsonObject, I extends VersionedSlotId>(
    slotId: I,
    fallbackContent: SlotContent<I, P>,
    options?: FetchOptions,
): CroctAtom<P, I> {
    const baseAtom = options?.timeout !== undefined
        ? atom<FetchResponse<I, P>>({content: fallbackContent})
        : persistentAtom<FetchResponse<I, P>>(`croct-nano|${slotId}`, {content: fallbackContent}, {
            encode: JSON.stringify,
            decode: JSON.parse,
        });

    const croctAtom: CroctAtom<P, I> = Object.assign(baseAtom, {
        [sign]: {
            slotId: slotId,
            options: options,
        },
        refresh: action(
            baseAtom,
            'refresh',
            (store, newOptions?: FetchOptions) => task(async () => {
                const response = await croct.fetch<P, I>(slotId, {
                    ...options,
                    ...newOptions,
                });

                store.set(response);
            }),
        ),
    });

    croctAtom.refresh();

    return croctAtom;
}

export function autoRefresh(store: CroctAtom<any, any>): void {
    onMount(store, () => {
        const interval = setInterval(store.refresh, 2000);

        return () => {
            clearInterval(interval);
        };
    });
}
