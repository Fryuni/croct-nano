import mod from '@croct/plug';
import type { GlobalPlug } from '@croct/plug/plug.js';

// Having the plug compatible with ancient CJS causes this thing
export const croct = mod.default ?? (mod as unknown as GlobalPlug);
