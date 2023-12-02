import {autoRefresh, croct, type CroctAtom, croctContent} from 'croct-nano';
import {action, task} from 'nanostores';

croct.plug({
    appId: import.meta.env.PUBLIC_CROCT_ID,
    debug: import.meta.env.DEV,
});

export const homeBannerStore = croctContent(
    'home-banner@1',
    {
        title: 'I present Croct-Nano',
        subtitle: 'The most flexible personalization tool ever.',
        cta: {
            label: 'Get started',
            link: 'https://docs.croct.com',
        },
    },
    {
        attributes: {
            demoName: 'croct-nano',
        },
    },
);

autoRefresh(homeBannerStore);

export const setName = action(homeBannerStore, 'setName', (_: CroctAtom, name: string) => {
    task(
        () => {
            if (name === '') {
                return croct.user
                    .edit()
                    .unset('custom.name')
                    .save();
            }

            return croct.user
                .edit()
                .set('custom.name', name)
                .save();
        },
    );
});
