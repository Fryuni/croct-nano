import type { FetchOptions, FetchResponse } from '@croct/plug/plug';
import type { SlotContent, VersionedSlotId } from '@croct/plug/slot';
import type { JsonObject } from '@croct/json';
import croct from '@croct/plug';
import { persistentAtom } from '@nanostores/persistent';
import { atom, onMount, task, type ReadableAtom, type WritableAtom } from 'nanostores';
import { resolvedAtom } from '@inox-tools/utils/nano';

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

type Options<P extends JsonObject, I extends VersionedSlotId> = Omit<
    FetchOptions<SlotContent<I, P>>,
    'fallback' | 'preferredLocale' | 'attributes'
> & {
    preferredLocale?: string | ReadableAtom<string>;
    attributes?: any;
};

const activeAtoms = new Set<CroctAtom<any, any>>();

/*#__PURE__*/
export function croctContent<P extends JsonObject, const I extends VersionedSlotId>(
    slotId: I,
    fallbackContent: SlotContent<I, P>,
    options: Options<P, I> = {},
): CroctAtom<P, I> {
    const baseAtom =
        options.timeout !== undefined
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
    const $options = resolvedAtom({
        preferredLocale: options.preferredLocale,
        attributes: options.attributes || {},
    });

    let lastAttrs: JsonObject;
    const refresh = () =>
        task(async () => {
            const attrs = $options.get();
            if (attrs === lastAttrs) return;
            try {
                const { content, metadata } = await croct.fetch(slotId, {
                    ...options,
                    ...attrs,
                });

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
        });

    const croctAtom: InnerCroctAtom<P, I> = Object.assign(baseAtom, {
        refresh: () => {
            lastAttrs = {};
            return refresh();
        },
    });

    if (typeof window !== 'undefined') croctAtom.refresh();

    onMount(croctAtom, () => {
        activeAtoms.add(croctAtom);
        const unbind = $options.subscribe(refresh);

        return () => {
            unbind();
            activeAtoms.delete(croctAtom);
        };
    });

    return croctAtom;
}

export function refreshActive() {
    for (const cAtom of activeAtoms) {
        cAtom.refresh();
    }
}
