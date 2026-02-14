import { defineConfig, envField } from 'astro/config';
import starlight from '@astrojs/starlight';
import liveCode from 'astro-live-code';

import react from '@astrojs/react';

import solidJs from '@astrojs/solid-js';
import preact from '@astrojs/preact';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: 'Croct Nanostores',
            credits: true,
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/Fryuni/croct-nano' },
            ],
            components: {
                Sidebar: './src/components/Sidebar.astro',
            },
            sidebar: [
                {
                    label: 'Getting started',
                    slug: 'getting-started',
                },
                {
                    label: 'Demo',
                    slug: 'demo',
                },
            ],
        }),
        liveCode({}),
        react({ include: '**/*.react.*' }),
        preact({ include: '**/*.preact.*' }),
        solidJs({ include: '**/*.solid.*' }),
        svelte(),
        vue(),
    ],
    env: {
        validateSecrets: true,
        schema: {
            CROCT_APP_ID: envField.string({
                context: 'client',
                access: 'public',
            }),
            // CROCT_API_KEY: envField.string({
            // 	context: 'server',
            // 	access: 'secret',
            // }),
        },
    },
    redirects: {
        '/examples': '/demo',
    },
});
