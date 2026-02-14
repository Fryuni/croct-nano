<p align="center">
    <a href="https://croct-nano-docs.vercel.app">
        <img src="https://croct-nano-docs.vercel.app/fancy-logo.png" alt="Croct Nanostores" height="200"/>
    </a>
    <br />
    <strong><a href="https://croct.com?utm_campaign=croct-nano&utm_source=package-readme">Croct</a> + Nanostores</strong>
    <br />
    Reactive, type-safe atoms for <a href="https://croct.com?utm_campaign=croct-nano&utm_source=package-readme">Croct</a> personalized content.
    <br />
    <sub>by <a href="https://fryuni.dev">Fryuni (Luiz Ferraz)</a> · Unofficial community library</sub>
</p>
<p align="center">
    <a href="https://croct-nano-docs.vercel.app">📖 Documentation</a>
    ·
    <a href="https://github.com/Fryuni/croct-nano/releases">📦 Releases</a>
    ·
    <a href="https://github.com/Fryuni/croct-nano/issues/new?labels=bug">🐞 Report Bug</a>
    ·
    <a href="https://github.com/Fryuni/croct-nano/issues/new?labels=enhancement">✨ Request Feature</a>
</p>

---

Croct Nanostores bridges [Croct](https://croct.com)'s personalization engine with [Nanostores](https://github.com/nanostores/nanostores), giving you reactive atoms that deliver personalized content to any UI framework.

**Why Croct Nanostores?**

- **Framework-agnostic** — One store, every framework. Works with React, Vue, Solid, Preact, and Svelte through the Nanostores ecosystem.
- **Type-safe** — Full TypeScript support with [Croct's type generation](https://docs.croct.com/reference/cli). Slot IDs, fallback content, and component props are all validated at compile time.
- **Fault-tolerant** — Atoms always hold renderable content. Fetches fail silently to your fallback; loaded content is never lost on refresh errors.
- **Auto-refreshing** — Content updates automatically when user behavior changes (sign-in, profile update, cart modification, and more).
- **Persistent** — Content is cached in `localStorage` by default, so returning users see personalized content instantly.

## Quick start

Install the package with your framework's Nanostores connector:

```sh
npm install croct-nanostores @nanostores/react
```

Initialize Croct and create a content atom:

```ts
import { croct, croctContent } from 'croct-nanostores';

croct.plug({ appId: '<YOUR_APP_ID>' });

export const banner = croctContent('home-banner@1', {
    title: 'Welcome',
    subtitle: 'Explore our latest collection',
    ctaLabel: 'Shop now',
    ctaLink: '/products',
});
```

Use it in your component:

```tsx
import { useStore } from '@nanostores/react';
import { banner } from './stores';

export function Banner() {
    const state = useStore(banner);

    return (
        <section>
            <h1>{state.content.title}</h1>
            <p>{state.content.subtitle}</p>
            <a href={state.content.ctaLink}>{state.content.ctaLabel}</a>
        </section>
    );
}
```

The atom renders your fallback immediately, fetches personalized content in the background, and re-renders your component when it arrives. If the fetch fails, the fallback stays — your UI never breaks.

## Documentation

Visit the [full documentation](https://croct-nano-docs.vercel.app) for:

- [Getting started](https://croct-nano-docs.vercel.app/getting-started) — Installation, initialization, framework setup, and type safety
- [Content rendering](https://croct-nano-docs.vercel.app/content-rendering) — State lifecycle, persistence, auto-refresh, and fault tolerance
- [API reference](https://croct-nano-docs.vercel.app/api-reference) — Complete reference for `croctContent`, `CroctAtom`, and `State`
- [Live demo](https://croct-nano-docs.vercel.app/demo) — Multi-framework rendering from a single store

## Contributing

Contributions to the package are always welcome!

- Report any bugs or issues on the [issue tracker](https://github.com/Fryuni/croct-nano/issues).
- For major changes, please [open an issue](https://github.com/Fryuni/croct-nano/issues) first to discuss what you would like to change.
- Please make sure to update tests as appropriate.

## Development

```sh
bun install         # Install dependencies
bun run build       # Build the library
bun run dev         # Watch mode
bun test            # Run tests
```

## License

MIT
