# Repository Guidelines

Unofficial Nanostores bindings for [Croct](https://croct.com) personalized content. ~130 lines of TypeScript that creates reactive atoms with optional auto-refresh on user behavior events. Framework-agnostic core with optional React/Vue/Solid/Preact/Svelte peer dependencies.

## Project Overview

**Purpose**: Bridge Croct's personalization SDK with Nanostores state management. Provides `croctContent()` factory for creating reactive atoms that fetch slot content, persist to localStorage, and auto-refresh when user interests/attributes change.

**Key Features**:

- Reactive atoms with `initial` → `loaded`/`fallback` state machine
- Optional localStorage persistence (`sticky` option, default true)
- Auto-refresh on user events (sign-in, profile changes, cart updates)
- Framework bindings via optional peer dependencies

**Published Package**: `croct-nanostores` v1.1.0

## Architecture & Data Flow

### Core Modules

| File                          | Responsibility                     | Key Exports                                              |
| ----------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `package/src/index.ts`        | Public API barrel                  | `croct`, `croctContent`, `CroctAtom`, tracking functions |
| `package/src/croctAtom.ts`    | Atom factory & state machine       | `croctContent()`, `CroctAtom` type, `refreshActive()`    |
| `package/src/croctPlugin.ts`  | Event-driven refresh orchestration | Side-effect: registers `auto-refresh-atom` plugin        |
| `package/src/autoPatching.ts` | Batched tracking integration       | `trackSessionField()`, `trackUserField()`, `trackCart()` |
| `package/src/common.ts`       | Shared SDK instance                | `croct` (from `@croct/plug`), `UnbindFn` type            |

### State Machine

```
State<I, P> =
  | { stage: 'initial' | 'fallback'; content: P; metadata?: never }
  | { stage: 'loaded'; content: SlotContent<I, P>; metadata: SlotMetadata }
```

Atoms start in `initial` with fallback content, transition to `loaded` on successful fetch, or `fallback` on error (unless already loaded).

### Data Flow

1. **Creation**: `croctContent(slotId, fallback, options)` creates atom with persistent/base store
2. **Mount**: `onMount` registers atom in `activeAtoms` Set, subscribes to options changes
3. **Fetch**: On options change or manual `refresh()`, fetches from Croct SDK
4. **Update**: Updates atom state with content + metadata
5. **Auto-refresh**: Plugin listens to tracking events → debounced `refreshActive()` cascade

### Auto-Refresh Behavior

The `auto-refresh-atom` plugin (registered via `croct.extend()` side-effect) listens to:
`userSignedIn`, `userSignedUp`, `userSignedOut`, `userProfileChanged`, `sessionAttributesChanged`, `orderPlaced`, `cartModified`, `interestShown`, `eventOccurred`

**Triple-cascade debounce**: Events trigger refresh at 500ms intervals up to 10 times (5 second window), not a single debounce. Clears and restarts on subsequent events.

## Key Directories

```
.
├── package/              # Published library
│   ├── src/              # Source (5 TypeScript files)
│   ├── test/             # Tests (bun:test + jest-extended)
│   └── dist/             # Build output (ESM + .d.ts)
├── docs/                 # Astro + Starlight documentation
│   ├── src/content/docs/ # MDX documentation pages
│   └── src/stores/       # Demo stores using library
├── examples/             # Example projects (workspace)
├── .github/workflows/    # CI, release, size-limit, snapshots
└── patches/              # Bun patches (astro-live-code)
```

## Development Commands

### Root-level (monorepo orchestration)

```bash
# Install dependencies
bun install

# Build library only
bun run build

# Dev watch mode (library)
bun run dev

# Run tests (serial, no concurrency)
bun run test

# Format all files (Prettier, write mode)
bun run format

# Docs development
bun run docs:dev

# Docs build
bun run docs:build

# Version bump (changeset + install + format)
bun run version

# Publish release (build + changeset publish)
bun run cut-release
```

### Package-level (`cd package`)

```bash
# Build (Bun.build + tsc declarations)
bun run build

# Dev watch
bun run dev

# Test with coverage
bun test --coverage

# Test watch mode
bun run test:dev

# Analyze bundle size
bun run size

# Prepack (build + copy README)
bun run prepack
```

## Code Conventions & Common Patterns

### Language & Module System

- **ESM-only**: `"type": "module"` in all package.json files
- **No CommonJS**: No `.cjs` output, no `require()`
- **TypeScript strict**: All strict flags enabled (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`)

### Formatting (Prettier)

Config: `prettier.config.js`

```javascript
{
    printWidth: 100,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    arrowParens: 'avoid',
    useTabs: false
}
```

- No ESLint: relies on TS strictness + Prettier only
- Self-documenting code: zero inline comments in source

### Naming & Patterns

- **Functions**: camelCase, pure where possible (marked with `/*#__PURE__*/`)
- **Types**: PascalCase, explicit generic constraints
- **Atoms**: prefixed with `$` (e.g., `$atom`, `$options`) - Nanostores convention
- **Exports**: Tree-shaking friendly, use `/*#__PURE__*/` annotation

### Async Patterns

- Uses Nanostores `task()` wrapper for async operations
- Debouncing via `setTimeout`/`clearTimeout` pattern (500ms default)
- Subscriptions return `UnbindFn` for cleanup

### State Management

- **Persistent by default**: `sticky: true` uses `persistentAtom` with localStorage key `croct-nano|{slotId}`
- **Ephemeral option**: Set `sticky: false` or `timeout` for session-only state
- **Reactive options**: `resolvedAtom` from `@inox-tools/utils` handles atom-based options

### Error Handling

- Fetch errors log to console and fall back to fallback content
- Already-loaded atoms stay loaded on refresh error (no fallback transition)

## Important Files

### Entry Points

- `package/src/index.ts` - Public API, imports `croctPlugin.ts` for side effects
- `package/dist/index.js` - Built ESM entry (published)
- `package/dist/index.d.ts` - Type declarations

### Build & Config

- `package/build.ts` - Bun.build orchestrator: bundles, minifies, excludes deps, emits sourcemaps
- `package/tsconfig.json` - Strict TS config for source + tests
- `package/tsconfig.build.json` - Declaration-only emit for distribution
- `package/.size-limit.json` - 5 bundle scenarios tracked in CI

### Monorepo Config

- `turbo.json` - Task orchestration: build depends on ^build, test depends on build
- `.changeset/config.json` - Changesets versioning (public access, main branch)
- Root `package.json` - Workspaces: docs, package, examples/\*, fixture dirs

### CI/CD

- `.github/workflows/ci.yml` - Build, lint (prettier --check), test
- `.github/workflows/release.yml` - Changeset-based release with npm provenance
- `.github/workflows/size-limit.yml` - Bundle size enforcement on PRs
- `.github/workflows/publish-preview.yml` - pkg-pr-new preview publishes

## Runtime/Tooling Preferences

### Required Runtime

- **Bun 1.3.9+** (specified in `packageManager` field)
- **Node 22** baseline for CI

### Package Manager

- Bun exclusively: `bun install`, `bun.lock` frozen lockfile
- CI uses `--frozen-lockfile`

### Build Tooling

- **Bun.build()** for bundling (not Rollup/esbuild directly)
- **TypeScript 5.8+** for declarations
- **Size-limit** + esbuild-why for bundle analysis

### Key Dependencies

- `@croct/plug` (peer, required): Croct SDK
- `nanostores`: Core state management
- `@nanostores/persistent`: localStorage persistence
- `@inox-tools/utils`: `resolvedAtom` for reactive options

### Optional Peer Dependencies

- `@nanostores/react`, `@nanostores/preact`, `@nanostores/solid`, `@nanostores/vue`

## Testing & QA

### Test Framework

- **bun:test** native runner (not Jest/Vitest)
- **jest-extended** matchers imported via `test/bun.setup.ts`
- Mocking with `vi.fn()` from Bun

### Test Files

- `package/test/croctAtom.test.ts` - Integration tests with mocked SDK
- `package/test/autoPatching.test.ts` - Store implementation tests

### Running Tests

```bash
# Once with coverage
bun test --coverage

# Watch mode
bun test --watch

# Via turbo (builds first)
bun run test
```

### CI Checks

- Format check: `prettier --check`
- Build: `bun run build` must succeed
- Tests: `bun test` with coverage
- Size limit: Bundle size must not exceed limits in `.size-limit.json`

### Quality Gates

- Turbo caching for builds (ignores tests/e2e)
- Changesets required for version bumps
- Size-limit enforced on PRs via GitHub Action
- TODO tracking: GitHub Action auto-creates issues from TODO comments

## Anti-Patterns (Avoid)

- **No `as any` in new code**: Existing casts in library source are intentional for Nanostores internal widening
- **No CommonJS**: ESM-only throughout
- **No test file edits without running tests**: Test infrastructure exists but coverage should be maintained
- **No orphan TODOs**: TODO tracking is active; leave explanatory comments or remove TODOs
- **No backwards-compat shims**: Full cutover when changing APIs; no gradual migration wrappers
