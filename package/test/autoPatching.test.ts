import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReadableAtom } from 'nanostores';

const sessionEdit = vi.hoisted(() => vi.fn());
const userEdit = vi.hoisted(() => vi.fn());

vi.mock('@croct/plug', () => ({
    default: {
        session: {
            edit: sessionEdit,
        },
        user: {
            edit: userEdit,
        },
    },
}));

const createReadableAtom = <T>(initial: T) => {
    let value = initial;
    const listeners = new Set<(next: T) => void>();

    return {
        subscribe: (listener: (next: T) => void) => {
            listeners.add(listener);
            listener(value);
            return () => {
                listeners.delete(listener);
            };
        },
        set: (next: T) => {
            value = next;
            for (const listener of listeners) {
                listener(value);
            }
        },
    } satisfies ReadableAtom<T> & { set: (next: T) => void };
};

async function flushTimers() {
    await Promise.resolve();
    vi.runOnlyPendingTimers();
    await Promise.resolve();
}

describe('auto patching', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        sessionEdit.mockReset();
        userEdit.mockReset();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('batches multiple session fields into a single patch', async () => {
        const { trackSessionField } = await import('../src/autoPatching.js');
        const patch = { set: vi.fn(), save: vi.fn() };
        sessionEdit.mockReturnValue(patch);

        const total = createReadableAtom(120);
        const currency = createReadableAtom('USD');

        trackSessionField('cart.total', total);
        trackSessionField('cart.currency', currency);

        await flushTimers();

        expect(sessionEdit).toHaveBeenCalledTimes(1);
        expect(patch.set).toHaveBeenCalledWith('cart.total', 120);
        expect(patch.set).toHaveBeenCalledWith('cart.currency', 'USD');
        expect(patch.save).toHaveBeenCalledTimes(1);
    });

    it('uses the latest value for repeated updates', async () => {
        const { trackSessionField } = await import('../src/autoPatching.js');
        const patch = { set: vi.fn(), save: vi.fn() };
        sessionEdit.mockReturnValue(patch);

        const total = createReadableAtom(100);
        trackSessionField('cart.total', total);

        await flushTimers();
        patch.set.mockClear();
        patch.save.mockClear();
        sessionEdit.mockClear();

        total.set(110);
        total.set(115);

        await flushTimers();

        const latestPatch = sessionEdit.mock.results[0]?.value as typeof patch;
        expect(latestPatch.set).toHaveBeenCalledTimes(1);
        expect(latestPatch.set).toHaveBeenCalledWith('cart.total', 115);
        expect(latestPatch.save).toHaveBeenCalledTimes(1);
    });

    it('stops tracking when unsubscribed', async () => {
        const { trackSessionField } = await import('../src/autoPatching.js');
        const patch = { set: vi.fn(), save: vi.fn() };
        sessionEdit.mockReturnValue(patch);

        const total = createReadableAtom(100);
        const unsubscribe = trackSessionField('cart.total', total);

        await flushTimers();
        sessionEdit.mockClear();
        patch.set.mockClear();
        patch.save.mockClear();

        unsubscribe();
        total.set(200);

        await flushTimers();

        expect(sessionEdit).not.toHaveBeenCalled();
        expect(patch.set).not.toHaveBeenCalled();
        expect(patch.save).not.toHaveBeenCalled();
    });

    it('patches user fields with croct.user.edit()', async () => {
        const { trackUserField } = await import('../src/autoPatching.js');
        const patch = { set: vi.fn(), save: vi.fn() };
        userEdit.mockReturnValue(patch);

        const name = createReadableAtom('Luiz');
        trackUserField('profile.name', name);

        await flushTimers();

        expect(userEdit).toHaveBeenCalledTimes(1);
        expect(patch.set).toHaveBeenCalledWith('profile.name', 'Luiz');
        expect(patch.save).toHaveBeenCalledTimes(1);
    });
});
