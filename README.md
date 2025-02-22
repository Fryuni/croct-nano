<p align="center">
    <a href="https://croct-nano-docs.vercel.dev">
        <img src="https://croct-nano-docs.vercel.dev/favicon.webp" alt="Croct Nanostores" height="200"/>
    </a>
    <br />
    <strong>[UNNOFICIAL] <a href="https://croct.com?utm_campaign=croct-nano&utm_source=package-readme">Croct</a> + Nanostore</strong>
    <br />
    A NanoStore atom for <a href="https://croct.com?utm_campaign=croct-nano&utm_source=package-readme">Croct</a> content.
    <br />
    <sub>by <a href="https://fryuni.dev">Fryuni (Luiz Ferraz)</a></sub>
</p>
<p align="center">
    <!-- <img alt="Build" src="https://img.shields.io/badge/build-passing-green" /> -->
    <!-- <img alt="Coverage" src="https://img.shields.io/badge/coverage-100%25-green" /> -->
    <!-- <img alt="Maintainability" src="https://img.shields.io/badge/maintainability-100-green" /> -->
    <!-- <br /> -->
    <br />
    <a href="https://github.com/Fryuni/croct-nano/releases">📦 Releases</a>
    ·
    <a href="https://github.com/Fryuni/croct-nano/issues/new?labels=bug">🐞 Report Bug</a>
    ·
    <a href="https://github.com/Fryuni/croct-nano/issues/new?labels=enhancement">✨ Request Feature</a>
</p>

## Installation

```sh
npm/yarn/pnpm install croct-nanostores
```

## Basic usage

```ts
import { croct, croctContent } from 'croct-nano';

croct.plug({ appId: '00000000-0000-0000-0000-000000000000' });

const homeBanner = croctContent('home-banner', {
    cta: {
        link: 'https://demo.croct.com/product/e-commerce#trending',
        label: 'SHOP NOW',
        labelColor: '#ffffff',
        backgroundColor: '#ff5353',
    },
    image: {
        main: 'https://demo.croct.com/assets/e-commerce/images/ban-1.png',
        background: 'https://demo.croct.com/assets/e-commerce/images/bg-1.jpg',
    },
    title: {
        text: 'Complete Women Fashion Here',
        color: '#000000',
    },
    preTitle: {
        text: 'ULTIMATE COLLECTION',
        color: '#565656',
    },
});
```

## Contributing

Contributions to the package are always welcome!

- Report any bugs or issues on the [issue tracker](https://github.com/Fryuni/croct-nano/issues).
- For major changes, please [open an issue](https://github.com/Fryuni/croct-nano/issues) first to discuss what you would like to change.
- Please make sure to update tests as appropriate.

## Testing

Before running the test suites, the development dependencies must be installed:

```sh
pnpm install
```

Then, to run all tests:

```sh
pnpm test
```

## Building

Before building the project, the dependencies must be installed:

```sh
pnpm install
```

Then, build with

```sh
pnpm build
```
