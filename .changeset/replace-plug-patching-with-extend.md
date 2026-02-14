---
'croct-nanostores': major
---

Replace `croct.plug()` monkey-patching with `croct.extend()` plugin registration and make `@croct/plug` a peer dependency.

Auto-refresh is no longer enabled by default. Consumers must add `'auto-refresh-atom'` to the `plugins` array when calling `croct.plug()` to opt in.
