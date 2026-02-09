import type { TrackingEventType } from '@croct/plug/sdk/tracking';
import { croct } from './plug.js';
import { mark, refreshActive } from './globalState.js';
import type { GlobalPlug } from '@croct/plug/plug';

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

export function register(): void {
    if ((croct as any)[mark] === true) return;

    const originalPlug = croct.plug.bind(croct);

    Object.assign(croct, {
        [mark]: true,
        plug: (options: Parameters<GlobalPlug['plug']>[0]) => {
            return originalPlug({
                ...options,
                plugins: {
                    ...options?.plugins,
                    'croct-nano': {},
                },
            });
        },
    });

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

                    refreshTimer = setTimeout(() => {
                        refreshActive();
                        refreshTimer = null;
                    }, 1500);
                }, 1000);
            }, 500);
        });

        return { enable() {}, disable() {} };
    });
}
