/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    PUBLIC_CROCT_ID: string;
}

declare module '@croct/plug/slot' {
    type HomeBannerV1 = {
        title: string,
        subtitle: string,
        cta: {
            label: string,
            link: string,
        },
    };

    interface VersionedSlotMap {
        'home-banner': {
            'latest': HomeBannerV1,
            '1': HomeBannerV1,
        };
    }
}

export {};
