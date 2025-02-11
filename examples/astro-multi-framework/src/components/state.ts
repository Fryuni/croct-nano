import { croct, type CroctAtom, croctContent } from 'croct-nano';
import { action, task } from 'nanostores';

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

export const setName = action(homeBannerStore, 'setName', (_: CroctAtom, name: string) => {
    task(async () => {
        const patch = croct.user.edit();

        if (name === '') {
            patch.unset('custom.name');
        } else {
            patch.set('custom.name', name);
        }

        await patch.save();
    });
});
