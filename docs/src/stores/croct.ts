import { croct, croctContent } from 'croct-nanostores';
import { allTasks } from 'nanostores';

if (!import.meta.env.SSR) {
    await import('@/utils/croctClient');
}

export const exampleSlot = croctContent('example@1', {
    _component: 'example-component@1',
    title: 'Default static content',
    body: 'This is defined inline in the store.',
});

export const setInterests = (interests: string) => {
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

await allTasks();
