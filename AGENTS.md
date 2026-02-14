# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-09
**Commit:** de5af9c
**Branch:** main

## OVERVIEW

Unofficial Nanostores bindings for [Croct](https://croct.com) personalized content. ~130 lines of TypeScript library code that creates reactive atoms with optional auto-refresh on user behavior events. Framework-agnostic core with `@croct/plug` as a peer dependency and optional React/Vue/Solid/Preact/Svelte peer deps.

## STRUCTURE

```
.
├── package/              # Library source (published as `croct-nanostores`)
│   ├── src/
│   │   ├── index.ts          # Barrel + side-effect import of croctPlugin
│   │   ├── croctAtom.ts      # croctContent() factory, CroctAtom type, state machine, active atom registry
│   │   └── croctPlugin.ts    # Registers auto-refresh-atom plugin via croct.extend(), event-driven refresh
│   ├── test/                 # Vitest setup only (no test files yet)
│   └── dist/                 # Built ESM output
├── docs/                 # Astro + Starlight documentation site with live code demos
├── patches/              # Bun patch for astro-live-code
└── .github/workflows/    # CI, release, size-limit, snapshot, todo-tracking
```

## WHERE TO LOOK

| Task                 | Location                        | Notes                                                            |
| -------------------- | ------------------------------- | ---------------------------------------------------------------- |
| Core atom logic      | `package/src/croctAtom.ts`      | State machine, active atom registry, `refreshActive()`           |
| Event-driven refresh | `package/src/croctPlugin.ts`    | Registers `auto-refresh-atom` plugin, debounced cascade          |
| Public API surface   | `package/src/index.ts`          | 3 exports: `croct`, `croctContent`, `CroctAtom`                  |
| Build config         | `package/build.ts`              | Bun.build() ESM-only, tree-shake smallest, minified              |
| Bundle size tracking | `package/.size-limit.json`      | 3 scenarios: full, already-using-croct, already-using-nanostores |
| Release workflow     | `.changeset/config.json`        | Changesets-based, public access                                  |
| Docs live examples   | `docs/src/stores/croct.ts`      | Real usage with slot content + user interests                    |
| Croct SDK init       | `docs/src/utils/croctClient.ts` | Client-side bootstrap pattern                                    |

## CODE MAP

| Symbol            | Type        | Location            | Role                                                 |
| ----------------- | ----------- | ------------------- | ---------------------------------------------------- |
| `croctContent()`  | Factory fn  | `croctAtom.ts:30`   | Creates reactive atom for a Croct slot with fallback |
| `CroctAtom<P,I>`  | Type        | `croctAtom.ts:14`   | `ReadableAtom<State> & { refresh() }`                |
| `State<I,P>`      | Union type  | `croctAtom.ts:10`   | `'initial' \| 'fallback' \| 'loaded'` tagged union   |
| `croct.extend()`  | Side-effect | `croctPlugin.ts:19` | Registers `auto-refresh-atom` plugin definition      |
| `activeAtoms`     | Set         | `croctAtom.ts:28`   | Module-level registry of mounted atoms               |
| `refreshActive()` | Function    | `croctAtom.ts:83`   | Bulk-refresh all active atoms                        |

## CONVENTIONS

- **ESM-only** — no CommonJS. `"type": "module"` everywhere
- **Prettier** — 100 char width, 4 spaces, single quotes, trailing commas all, `arrowParens: avoid`
- **TypeScript strict** — all strict flags ON: `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`, `noImplicitReturns`, `verbatimModuleSyntax`
- **No ESLint** — relies on TS strictness + Prettier format check only
- **Self-documenting** — zero inline comments in source; code should speak for itself
- **Bun 1.3.9+** with workspaces, Turbo orchestration
- **Node 22** baseline (CI)
- **Changesets** for versioning — run `bunx changeset` before PRing version bumps
- **TODO tracking** — GitHub Action auto-creates issues from TODO comments; don't leave orphan TODOs

## ANTI-PATTERNS (THIS PROJECT)

- **No `as any` in new code** — existing `as any` casts in library source are intentional for Nanostores internal type widening
- **No test files exist yet** — test infrastructure is ready (Vitest + jest-extended) but tests haven't been written
- **`croct.extend()` called as module side-effect** — importing the library registers the `auto-refresh-atom` plugin definition. Consumers must still opt in by adding `'auto-refresh-atom'` to `plugins` in `croct.plug()`

## UNIQUE STYLES

- **Persistent by default** — atoms use localStorage (`croct-nano|{slotId}` key) unless `timeout` option is set, then ephemeral
- **Triple-cascade debounce** — refresh on domain events fires 3 times at 500ms/1000ms/1500ms intervals (not a single debounce)
- **Plugin registration via `croct.extend()`** — `croctPlugin.ts` registers the `auto-refresh-atom` plugin definition as a side-effect import; consumers opt in by adding `'auto-refresh-atom'` to `plugins` in `croct.plug()`
- **Framework-agnostic via peer deps** — `@nanostores/react`, `/vue`, `/solid`, `/preact` all optional
- **Docs as workspace member** — Astro site uses `croct-nanostores: "workspace:"` for live integration testing
- **Multi-framework docs** — Astro config uses file-based framework routing: `*.react.*`, `*.preact.*`, `*.solid.*`

## COMMANDS

```bash
# Install
bun install

# Build library
bun run build

# Dev (watch mode)
bun run dev

# Test (coverage)
bun test

# Format (write)
bun run format

# Format check (CI)
bun run format --check

# Docs dev
bun run docs:dev

# Docs build
bun run docs:build

# Size analysis
cd package && bunx size-limit

# Version bump
bunx changeset
bun run version

# Release
bun run cut-release
```

## NOTES

- **Turbo caching** — build inputs exclude `tests/` and `e2e/` dirs; test task has cache disabled
- **Test concurrency disabled** — root scripts use `--concurrency=1` for test tasks
- **Snapshot releases** — PR comment `/snapshot <name>` triggers snapshot publish via CI
- **Size-limit** enforced on PRs via `@size-limit/preset-small-lib`
- **Domain events triggering refresh**: `userSignedIn/Out/Up`, `userProfileChanged`, `sessionAttributesChanged`, `orderPlaced`, `cartModified`, `interestShown`, `eventOccurred`
