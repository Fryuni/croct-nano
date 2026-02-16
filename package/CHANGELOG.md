# croct-nanostores

## 1.0.0

### Major Changes

- a2e714a: Replace `croct.plug()` monkey-patching with `croct.extend()` plugin registration and make `@croct/plug` a peer dependency.

    Auto-refresh is no longer enabled by default. Consumers must add `'auto-refresh-atom'` to the `plugins` array when calling `croct.plug()` to opt in.

### Minor Changes

- e21c13d: Expose slot metadata in loaded state and enforce atom immutability at runtime by removing the `set` method from the public atom object.
- 8a658cf: Support Nanostores atoms inside `attributes` at any nesting level and accept `ReadableAtom<string>` for `preferredLocale`. Content automatically refreshes whenever any embedded atom updates.
- 89bb215: Add helpers to sync Nanostores values into Croct session and user fields, batching updates into a single patch per tick.

### Patch Changes

- 2e00fe8: Add `trackCart` for automatic cart tracking via the `cartModified` event.

## 0.2.0

### Minor Changes

- 18d06f0: Export `CroctAtom` as read-only

### Patch Changes

- 89a85d5: Fixes error about double registering plugin on HMR
- 655060b: Fix flash of default content during debouncing

## 0.1.0

### Minor Changes

- bc7754e: First release

### Patch Changes

- bc7754e: Restrict type to only include content
- bc7754e: Fix bundling and module export

## 0.1.0-beta.2

### Patch Changes

- 3883f90: Fix bundling and module export

## 0.1.0-beta.1

### Patch Changes

- Restrict type to only include content

## 0.1.0-beta.0

### Minor Changes

- 7115cef: First release
