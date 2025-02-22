import type { CroctAtom } from './croctAtom.js';

export const mark = Symbol.for('@fryuni/croct-nano');

type GlobalState = {
    a: Set<CroctAtom<any, any>>;
    r: () => void;
};

const state: GlobalState = ((globalThis as any)[mark] ??= {
    a: new Set<CroctAtom<any, any>>(),
    r: (): void => {
        for (const atom of (globalThis as any)[mark].a) {
            atom.refresh();
        }
    },
});

export const activeAtoms = state.a;
export const refreshActive = state.r;
