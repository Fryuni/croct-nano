import croct from '@croct/plug';
import type { FetchOptions, FetchResponse } from '@croct/plug/plug';
import type { JsonObject } from '@croct/plug/sdk/json';
import type { TrackingEventType } from '@croct/plug/sdk/tracking';
import type { SlotContent, VersionedSlotId } from '@croct/plug/slot';
import { persistentAtom } from '@nanostores/persistent';
import { atom, onMount, task, type WritableAtom } from 'nanostores';

export type CroctAtom<
    P extends JsonObject = JsonObject,
    I extends VersionedSlotId = string,
> = WritableAtom<FetchResponse<I, P>> & {
    refresh: () => Promise<void>;
};

const activeAtoms = new Set<CroctAtom<any, any>>();

export function croctContent<P extends JsonObject, I extends VersionedSlotId>(
    slotId: I,
    fallbackContent: SlotContent<I, P>,
    options?: FetchOptions,
): CroctAtom<P, I> {
    const baseAtom =
        options?.timeout !== undefined
            ? atom<FetchResponse<I, P>>({ content: fallbackContent })
            : persistentAtom<FetchResponse<I, P>>(
                  `croct-nano|${slotId}`,
                  { content: fallbackContent },
                  {
                      encode: JSON.stringify,
                      decode: JSON.parse,
                  },
              );

    const croctAtom: CroctAtom<P, I> = Object.assign(baseAtom, {
        refresh: () =>
            task(async () => {
                const response = await croct.fetch<P, I>(slotId, options).catch(error => {
                    console.error(`Error while refreshing Croct Atom for "${slotId}":\n`, error);

                    return { content: fallbackContent };
                });

                croctAtom.set(response);
            }),
    });

    croctAtom.refresh();

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

function refreshActive() {
    for (const croctAtom of activeAtoms) {
        croctAtom.refresh();
    }
}

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

    // Plugin has no controllable parts
    return { enable: () => {}, disable: () => {} };
});
