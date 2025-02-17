import { croct, croctContent } from 'croct-nanostores';

export const exampleSlot = croctContent('example@1', {
    _component: 'example-component@1',
    title: 'Default static content',
    body: 'This is defined inline in the store.',
});

export const setInterests = (interests: string) => {
    console.log({ interests });
    croct.user
        .edit()
        .set(
            'interests',
            interests
                .split(',')
                .map(i => i.trim())
                .filter(Boolean),
        )
        .save();
};
