---
'croct-nanostores': minor
---

Add `sticky` option to `croctContent()` for explicit control over localStorage persistence

The new `sticky` option (default: `true`) replaces the implicit behavior where `timeout` controlled persistence. Atoms are now persistent by default regardless of other options. Set `sticky: false` to opt out of localStorage caching.

Also enables cross-tab synchronization via `listen: true` on persistent atoms.
