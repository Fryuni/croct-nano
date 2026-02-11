import type { FetchOptions, FetchResponse } from '@croct/plug/plug';
import type { SlotContent, VersionedSlotId } from '@croct/plug/slot';
import type { JsonObject } from '@croct/json';
import { croct } from './plug.js';
import { persistentAtom } from '@nanostores/persistent';
import { atom, onMount, task, type ReadableAtom, type WritableAtom } from 'nanostores';
import { activeAtoms } from './globalState.js';

type SlotMetadata = NonNullable<FetchResponse<any>['metadata']>;

type State<I extends VersionedSlotId = string, P extends JsonObject = JsonObject> =
    | { stage: 'initial' | 'fallback'; content: P; metadata?: never }
    | { stage: 'loaded'; content: SlotContent<I, any>; metadata: SlotMetadata };

export type CroctAtom<
    P extends JsonObject = JsonObject,
    I extends VersionedSlotId = string,
> = ReadableAtom<State<I, P>> & {
    refresh: () => Promise<void>;
};

type InnerCroctAtom<
    P extends JsonObject = JsonObject,
    I extends VersionedSlotId = string,
> = WritableAtom<State<I, P>> & {
    refresh: () => Promise<void>;
};

export function croctContent<P extends JsonObject, const I extends VersionedSlotId>(
    slotId: I,
    fallbackContent: SlotContent<I, P>,
    options?: Omit<FetchOptions<SlotContent<I, P>>, 'fallback'>,
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
    const { set } = baseAtom;
    delete (baseAtom as Partial<WritableAtom<State<I, P>>>).set;

    const croctAtom: InnerCroctAtom<P, I> = Object.assign(baseAtom, {
        refresh: () =>
            task(async () => {
                try {
                    const { content, metadata } = await croct.fetch(slotId, options);

                    set({
                        stage: 'loaded',
                        content: content as SlotContent<I, any>,
                        metadata: metadata!,
                    });
                } catch (error) {
                    console.error(`Error while refreshing Croct Atom for "${slotId}":\n`, error);

                    if (croctAtom.value?.stage !== 'loaded') {
                        set({ stage: 'fallback', content: fallbackContent as P });
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
