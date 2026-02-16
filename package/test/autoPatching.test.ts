import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { atom } from 'nanostores';

const sessionEdit = vi.hoisted(() => vi.fn());
const userEdit = vi.hoisted(() => vi.fn());
const track = vi.hoisted(() => vi.fn());

vi.mock('@croct/plug', () => ({
    default: {
        track,
        session: {
            edit: sessionEdit,
        },
        user: {
            edit: userEdit,
        },
    },
}));

const createReadableAtom = <T>(initial: T) => {
    return atom(initial);
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
        track.mockReset();
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

    it('tracks cart updates with cartModified', async () => {
        const { trackCart } = await import('../src/autoPatching.js');
        const cart = createReadableAtom({
            currency: 'USD',
            total: 899.99,
            items: [
                {
                    index: 0,
                    quantity: 1,
                    total: 899.99,
                    product: {
                        productId: '12345',
                        name: 'Black iPhone 12',
                        displayPrice: 899.99,
                    },
                },
            ],
        });

        trackCart(cart);

        await flushTimers();

        expect(track).toHaveBeenCalledTimes(1);
        expect(track).toHaveBeenCalledWith('cartModified', {
            cart: {
                currency: 'USD',
                total: 899.99,
                items: [
                    {
                        index: 0,
                        quantity: 1,
                        total: 899.99,
                        product: {
                            productId: '12345',
                            name: 'Black iPhone 12',
                            displayPrice: 899.99,
                        },
                    },
                ],
            },
        });
    });

    it('uses latest cart state for repeated updates', async () => {
        const { trackCart } = await import('../src/autoPatching.js');
        const cart = createReadableAtom({
            currency: 'USD',
            total: 100,
            items: [
                {
                    index: 0,
                    quantity: 1,
                    total: 100,
                    product: {
                        productId: 'sku-1',
                        name: 'Item',
                        displayPrice: 100,
                    },
                },
            ],
        });

        trackCart(cart);

        await flushTimers();
        track.mockClear();

        cart.set({
            currency: 'USD',
            total: 115,
            items: [
                {
                    index: 0,
                    quantity: 1,
                    total: 115,
                    product: {
                        productId: 'sku-1',
                        name: 'Item',
                        displayPrice: 115,
                    },
                },
            ],
        });

        cart.set({
            currency: 'USD',
            total: 120,
            items: [
                {
                    index: 0,
                    quantity: 1,
                    total: 120,
                    product: {
                        productId: 'sku-1',
                        name: 'Item',
                        displayPrice: 120,
                    },
                },
            ],
        });

        await flushTimers();

        expect(track).toHaveBeenCalledTimes(1);
        expect(track).toHaveBeenCalledWith('cartModified', {
            cart: {
                currency: 'USD',
                total: 120,
                items: [
                    {
                        index: 0,
                        quantity: 1,
                        total: 120,
                        product: {
                            productId: 'sku-1',
                            name: 'Item',
                            displayPrice: 120,
                        },
                    },
                ],
            },
        });
    });

    it('stops cart tracking when unsubscribed', async () => {
        const { trackCart } = await import('../src/autoPatching.js');
        const cart = createReadableAtom({
            currency: 'USD',
            total: 100,
            items: [
                {
                    index: 0,
                    quantity: 1,
                    total: 100,
                    product: {
                        productId: 'sku-1',
                        name: 'Item',
                        displayPrice: 100,
                    },
                },
            ],
        });

        const unsubscribe = trackCart(cart);

        await flushTimers();
        track.mockClear();

        unsubscribe();
        cart.set({
            currency: 'USD',
            total: 200,
            items: [
                {
                    index: 0,
                    quantity: 2,
                    total: 200,
                    product: {
                        productId: 'sku-1',
                        name: 'Item',
                        displayPrice: 100,
                    },
                },
            ],
        });

        await flushTimers();

        expect(track).not.toHaveBeenCalled();
    });

    it('ignores null cart values', async () => {
        const { trackCart } = await import('../src/autoPatching.js');
        const cart = createReadableAtom<{
            currency: string;
            total: number;
            items: {
                index: number;
                quantity: number;
                total: number;
                product: { productId: string; name: string; displayPrice: number };
            }[];
        } | null>(null);

        trackCart(cart);

        await flushTimers();

        expect(track).not.toHaveBeenCalled();
    });
});
