import type { FetchOptions } from '@croct/plug/plug.js';
import type { JsonObject } from '@croct/plug/sdk/json.js';
import type { SlotContent, VersionedSlotId } from '@croct/plug/slot.js';
import { croct } from './plug.js';
import { persistentAtom } from '@nanostores/persistent';
import { atom, onMount, task, type WritableAtom } from 'nanostores';
import { activeAtoms } from './globalState.js';

type State<I extends VersionedSlotId = string, P extends JsonObject = JsonObject> =
    | { stage: 'initial' | 'fallback'; content: P }
    | { stage: 'loaded'; content: SlotContent<I, any> };

export type CroctAtom<
    P extends JsonObject = JsonObject,
    I extends VersionedSlotId = string,
> = WritableAtom<State<I, P>> & {
    refresh: () => Promise<void>;
};

const activeAtoms = new Set<CroctAtom<any, any>>();

export function croctContent<P extends JsonObject, const I extends VersionedSlotId>(
    slotId: I,
    fallbackContent: SlotContent<I, P>,
    options?: FetchOptions,
): CroctAtom<P, I> {
    const baseAtom =
        options?.timeout !== undefined
            ? atom<State<I, P>>({ stage: 'initial', content: fallbackContent as P })
            : persistentAtom<State<I, P>>(
                `croct-nano|${slotId}`,
                { stage: 'initial', content: fallbackContent as P },
                {
                    encode: JSON.stringify,
                    decode: JSON.parse,
                },
            );

    const croctAtom: CroctAtom<P, I> = Object.assign(baseAtom, {
        refresh: () =>
            task(async () => {
                try {
                    const { content } = await croct.fetch<any, I>(slotId, options);

                    croctAtom.set({ stage: 'loaded', content });
                } catch (error) {
                    console.error(`Error while refreshing Croct Atom for "${slotId}":\n`, error);

                    if (croctAtom.value?.stage !== 'loaded') {
                        croctAtom.set({ stage: 'fallback', content: fallbackContent as P });
                    }
                }
            }),
    });

    if (typeof window !== 'undefined') croctAtom.refresh();

    onMount(croctAtom, () => {
        activeAtoms.add(croctAtom);

        return () => {
            activeAtoms.delete(croctAtom);
        };
    });

    return croctAtom;
}
