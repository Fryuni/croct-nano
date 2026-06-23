import { croct } from 'croct-nanostores';
import { CROCT_APP_ID } from 'astro:env/client';
import type { GlobalPlug } from '@croct/plug/plug';

croct.plug({
    appId: CROCT_APP_ID,
    debug: import.meta.env.DEV,
    token: null,
    disableCidMirroring: true,
    plugins: { 'auto-refresh-atom': true },
});

declare global {
    interface Window {
        croct: GlobalPlug;
    }
}

window.croct = croct;

export default croct;
export { croct };
