import type { FetchOptions } from '@croct/plug/plug.js';
import type { JsonObject } from '@croct/plug/sdk/json.js';
import type { TrackingEventType } from '@croct/plug/sdk/tracking.js';
import type { SlotContent, VersionedSlotId } from '@croct/plug/slot.js';
import { croct } from './plug.js';
import { persistentAtom } from '@nanostores/persistent';
import { atom, onMount, task, type WritableAtom } from 'nanostores';

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

const refreshEvents: TrackingEventType[] = [
    'userSignedIn',
    'userSignedUp',
    'userSignedOut',
    'userProfileChanged',
    'sessionAttributesChanged',
    'orderPlaced',
    'cartModified',
    'interestShown',
    'eventOccurred',
];

let refreshTimer: NodeJS.Timeout | null = null;

export function refreshActive() {
    for (const croctAtom of activeAtoms) {
        croctAtom.refresh();
    }
}

let registered = false;

export function register(): void {
    if (registered) return;
    registered = true;

    const originalPlug = croct.plug.bind(croct);

    croct.plug = options => {
        return originalPlug({
            ...options,
            plugins: {
                ...options?.plugins,
                'croct-nano': {},
            },
        });
    };

    croct.extend('croct-nano', ({ sdk }) => {
        sdk.tracker.addListener(({ event }) => {
            if (!refreshEvents.includes(event.type)) return;

            if (refreshTimer) {
                clearTimeout(refreshTimer);
            }

            refreshTimer = setTimeout(() => {
                refreshActive();

                refreshTimer = setTimeout(() => {
                    refreshActive();
                    refreshTimer = null;
                }, 2500);
            }, 500);
        });

        return { enable() {}, disable() {} };
    });
}
