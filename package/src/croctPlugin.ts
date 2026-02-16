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

let pendingTimer: NodeJS.Timeout | undefined;
let run = (counter: number = 10) => {
    refreshActive();
    if (counter > 0) {
        pendingTimer = setTimeout(() => run(counter - 1), 500);
    }
};

croct.extend('auto-refresh-atom', ({ sdk }) => {
    sdk.tracker.addListener(({ event }) => {
        if (!refreshEvents.includes(event.type)) return;
        clearTimeout(pendingTimer);
        pendingTimer = setTimeout(run, 500);
    });

    return { enable() {} };
});
