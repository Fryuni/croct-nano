import type { TrackingEventType } from '@croct/plug/sdk/tracking';
import { refreshActive } from './croctAtom.js';
import { croct } from './common.js';

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

croct.extend('auto-refresh-atom', ({ sdk }) => {
    sdk.tracker.addListener(({ event }) => {
        if (!refreshEvents.includes(event.type)) return;

        if (refreshTimer) {
            clearTimeout(refreshTimer);
        }

        refreshTimer = setTimeout(() => {
            refreshActive();

            refreshTimer = setTimeout(() => {
                refreshActive();

                refreshTimer = setTimeout(() => {
                    refreshActive();
                    refreshTimer = null;
                }, 1500);
            }, 1000);
        }, 500);
    });

    return { enable() {}, disable() {} };
});
