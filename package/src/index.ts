import './croctPlugin.js';
import croct from '@croct/plug';
import { type CroctAtom, croctContent } from './croctAtom.js';
export { trackSessionField, trackUserField } from './autoPatching.js';

export { croct, croctContent, type CroctAtom };
