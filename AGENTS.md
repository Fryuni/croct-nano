# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-09
**Commit:** de5af9c
**Branch:** main

## OVERVIEW

Unofficial Nanostores bindings for [Croct](https://croct.com) personalized content. ~165 lines of TypeScript library code that creates reactive atoms auto-refreshing on user behavior events. Framework-agnostic core with optional React/Vue/Solid/Preact/Svelte peer deps.

## STRUCTURE

```
.
├── package/              # Library source (published as `croct-nanostores`)
│   ├── src/
│   │   ├── index.ts          # Barrel + register() side-effect on import
│   │   ├── croctAtom.ts      # croctContent() factory, CroctAtom type, state machine
│   │   ├── croctPlugin.ts    # Auto-registers Croct plugin, event-driven refresh
│   │   ├── globalState.ts    # Symbol-namespaced active atom registry on globalThis
│   │   └── plug.ts           # Re-exports @croct/plug singleton
│   ├── test/                 # Vitest setup only (no test files yet)
│   └── dist/                 # Built ESM output
├── docs/                 # Astro + Starlight documentation site with live code demos
├── patches/              # pnpm patch for astro-live-code
└── .github/workflows/    # CI, release, size-limit, snapshot, todo-tracking
```

## WHERE TO LOOK

| Task                 | Location                        | Notes                                                            |
| -------------------- | ------------------------------- | ---------------------------------------------------------------- |
| Core atom logic      | `package/src/croctAtom.ts`      | State machine: initial→loaded→fallback                           |
| Event-driven refresh | `package/src/croctPlugin.ts`    | Debounced cascade: 500ms→1s→1.5s                                 |
| Global atom registry | `package/src/globalState.ts`    | `Symbol.for('@fryuni/croct-nano')` on globalThis                 |
| Public API surface   | `package/src/index.ts`          | 3 exports: `croct`, `croctContent`, `CroctAtom`                  |
| Build config         | `package/tsup.config.ts`        | ESM-only, tree-shake smallest, minified                          |
| Bundle size tracking | `package/.size-limit.json`      | 3 scenarios: full, already-using-croct, already-using-nanostores |
| Release workflow     | `.changeset/config.json`        | Changesets-based, public access                                  |
| Docs live examples   | `docs/src/stores/croct.ts`      | Real usage with slot content + user interests                    |
| Croct SDK init       | `docs/src/utils/croctClient.ts` | Client-side bootstrap pattern                                    |

## CODE MAP

| Symbol            | Type        | Location            | Role                                                 |
| ----------------- | ----------- | ------------------- | ---------------------------------------------------- |
| `croctContent()`  | Factory fn  | `croctAtom.ts:27`   | Creates reactive atom for a Croct slot with fallback |
| `CroctAtom<P,I>`  | Type        | `croctAtom.ts:13`   | `ReadableAtom<State> & { refresh() }`                |
| `State<I,P>`      | Union type  | `croctAtom.ts:9`    | `'initial' \| 'fallback' \| 'loaded'` tagged union   |
| `register()`      | Side-effect | `croctPlugin.ts:20` | Monkey-patches `croct.plug()` to inject plugin       |
| `activeAtoms`     | Set         | `globalState.ts:19` | Global registry of mounted atoms                     |
| `refreshActive()` | Function    | `globalState.ts:20` | Bulk-refresh all active atoms                        |
| `mark`            | Symbol      | `globalState.ts:3`  | Collision-safe namespace key                         |

## CONVENTIONS

- **ESM-only** — no CommonJS. `"type": "module"` everywhere
- **Prettier** — 100 char width, 4 spaces, single quotes, trailing commas all, `arrowParens: avoid`
- **TypeScript strict** — all strict flags ON: `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`, `noImplicitReturns`, `verbatimModuleSyntax`
- **No ESLint** — relies on TS strictness + Prettier format check only
- **Self-documenting** — zero inline comments in source; code should speak for itself
- **pnpm 10.29.2+** with workspaces, Turbo orchestration
- **Node 22** baseline (CI)
- **Changesets** for versioning — run `pnpm changeset` before PRing version bumps
- **TODO tracking** — GitHub Action auto-creates issues from TODO comments; don't leave orphan TODOs

## ANTI-PATTERNS (THIS PROJECT)

- **No `as any` in new code** — existing `(croct as any)[mark]` and `(globalThis as any)[mark]` are intentional for Symbol property access
- **No test files exist yet** — test infrastructure is ready (Vitest + jest-extended) but tests haven't been written
- **`package/package.json` "files" field lists "build" dir** — this dir doesn't exist; `dist/` is the actual output. Likely a leftover from template
- **`register()` called as module side-effect** — importing the library auto-registers the plugin. This is intentional, not accidental

## UNIQUE STYLES

- **Persistent by default** — atoms use localStorage (`croct-nano|{slotId}` key) unless `timeout` option is set, then ephemeral
- **Triple-cascade debounce** — refresh on domain events fires 3 times at 500ms/1000ms/1500ms intervals (not a single debounce)
- **Plugin monkey-patching** — `register()` wraps `croct.plug()` to inject `'croct-nano'` plugin automatically
- **Framework-agnostic via peer deps** — `@nanostores/react`, `/vue`, `/solid`, `/preact` all optional
- **Docs as workspace member** — Astro site uses `croct-nanostores: "workspace:"` for live integration testing
- **Multi-framework docs** — Astro config uses file-based framework routing: `*.react.*`, `*.preact.*`, `*.solid.*`

## COMMANDS

```bash
# Install
pnpm install

# Build library
pnpm build

# Dev (watch mode)
pnpm dev

# Test (coverage)
pnpm test

# Format (write)
pnpm format

# Format check (CI)
pnpm format --check

# Docs dev
pnpm docs:dev

# Docs build
pnpm docs:build

# Size analysis
cd package && pnpm size

# Version bump
pnpm changeset
pnpm version

# Release
pnpm cut-release
```

## NOTES

- **No dedup violations allowed** — CI runs `pnpm dedupe --prefer-offline --check`
- **Turbo caching** — build inputs exclude `tests/` and `e2e/` dirs; test task has cache disabled
- **Test concurrency disabled** — root scripts use `--concurrency=1` for test tasks
- **Snapshot releases** — PR comment `/snapshot <name>` triggers snapshot publish via CI
- **Size-limit** enforced on PRs via `@size-limit/preset-small-lib`
- **Domain events triggering refresh**: `userSignedIn/Out/Up`, `userProfileChanged`, `sessionAttributesChanged`, `orderPlaced`, `cartModified`, `interestShown`, `eventOccurred`
