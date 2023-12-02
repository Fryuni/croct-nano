<p align="center">
    <a href="https://croct.com">
        <img src="https://cdn.croct.io/brand/logo/repo-icon-green.svg" alt="Croct" height="80"/>
    </a>
    <br />
    <strong>[UNNOFICIAL] Croct + Nanostore</strong>
    <br />
    A Nanostore for Croct interactions.
</p>
<p align="center">
    <img alt="Build" src="https://img.shields.io/badge/build-passing-green" />
    <img alt="Coverage" src="https://img.shields.io/badge/coverage-100%25-green" />
    <img alt="Maintainability" src="https://img.shields.io/badge/maintainability-100-green" />
    <br />
    <br />
    <a href="https://github.com/Fryuni/croct-nano/releases">📦 Releases</a>
    ·
    <a href="https://github.com/Fryuni/croct-nano/issues/new?labels=bug&template=bug-report.md">🐞 Report Bug</a>
    ·
    <a href="https://github.com/Fryuni/croct-nano/issues/new?labels=enhancement&template=feature-request.md">✨ Request Feature</a>
</p>

## Installation
We recommend using [YARN](https://yarnpkg.com) to install the package:

```sh
npm install croct-nano
```

```sh
yarn add croct-nano
```

## Basic usage

```typescript
import {Example} from 'croct-nano';

const example = new Example();
example.displayBasicUsage();
```

## Contributing
Contributions to the package are always welcome! 

- Report any bugs or issues on the [issue tracker](https://github.com/Fryuni/croct-nano/issues).
- For major changes, please [open an issue](https://github.com/Fryuni/croct-nano/issues) first to discuss what you would like to change.
- Please make sure to update tests as appropriate.

## Testing

Before running the test suites, the development dependencies must be installed:

```sh
yarn
```

Then, to run all tests:

```sh
yarn test
```

Run the following command to check the code against the style guide:

```sh
yarnlint
```

## Building

Before building the project, the dependencies must be installed:

```sh
yarn
```

Then, to build the CommonJS module:

```sh
yarn rollup
```

The following command bundles a minified IIFE module for browsers:

```
yarn rollup-min
```

## License

Logo and "Croct" brand are owned by Croct Limited.
