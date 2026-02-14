import { croct } from 'croct-nanostores';
import type { GlobalPlug } from '@croct/plug/plug.js';
import { CROCT_APP_ID } from 'astro:env/client';

croct.plug({
    appId: CROCT_APP_ID,
    debug: import.meta.env.DEV,
    token: null,
    plugins: ['auto-refresh-atom'],
});

declare global {
    interface Window {
        croct: GlobalPlug;
    }
}

window.croct = croct;

export default croct;
export { croct };
