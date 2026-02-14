import { afterAll, beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const persistMocks = vi.hoisted(() => ({
    persistentAtom: vi.fn(),
}));

const croctFetch = vi.hoisted(() => vi.fn());

const croctExtend = vi.hoisted(() =>
    vi.fn(
        (
            name: string,
            factory: (args: { sdk: { tracker: { addListener: Function } } }) => unknown,
        ) => {
            const listeners = new Set<(payload: { event: { type: string } }) => void>();
            const tracker = {
                addListener: (listener: (payload: { event: { type: string } }) => void) => {
                    listeners.add(listener);
                },
                emit: (type: string) => {
                    for (const listener of listeners) {
                        listener({ event: { type } });
                    }
                },
            };
            factory({ sdk: { tracker } });
            return tracker;
        },
    ),
);

const nanoTask = vi.hoisted(() => (fn: () => Promise<void>) => fn());
const createAtom = vi.hoisted(() => (initial: unknown) => {
    const listeners = new Set<() => void>();
    const store = {
        value: initial,
        set: (value: unknown) => {
            store.value = value;
            for (const listener of listeners) {
                listener();
            }
        },
        listen: (listener: () => void) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        _listeners: listeners,
        _onMount: undefined as undefined | (() => () => void),
    };
    return store;
});

const originalWindow = globalThis.window;

vi.mock('@croct/plug', () => ({
    default: {
        fetch: croctFetch,
        extend: croctExtend,
    },
}));

vi.mock('@nanostores/persistent', () => ({
    persistentAtom: persistMocks.persistentAtom,
}));

vi.mock('nanostores', () => ({
    atom: createAtom,
    onMount: (store: { _onMount?: () => () => void }, handler: () => () => void) => {
        store._onMount = handler;
    },
    task: nanoTask,
}));

async function advanceTimers(ms: number) {
    await Promise.resolve();
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
}

describe('croctContent', () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });

    beforeEach(() => {
        vi.resetModules();
        globalThis.window = undefined;
        croctFetch.mockReset();
        persistMocks.persistentAtom.mockReset();
        persistMocks.persistentAtom.mockImplementation((_key, initial) => createAtom(initial));
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    afterAll(() => {
        globalThis.window = originalWindow;
    });

    it('starts with fallback content in initial stage', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };
        const atom = croctContent('home-banner@1', fallback);

        expect(atom.value).toEqual({ stage: 'initial', content: fallback });
    });

    it('loads content and metadata on successful refresh', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };
        const loaded = { title: 'Hola' };
        const metadata = { experimentId: 'exp-1' };

        croctFetch.mockResolvedValue({ content: loaded, metadata });

        const atom = croctContent('home-banner@1', fallback);
        await atom.refresh();

        expect(croctFetch).toHaveBeenCalledWith('home-banner@1', undefined);
        expect(atom.value).toEqual({ stage: 'loaded', content: loaded, metadata });
    });

    it('auto-refreshes on creation in browser environments', async () => {
        globalThis.window = {} as Window & typeof globalThis;
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };
        croctFetch.mockResolvedValue({ content: fallback, metadata: { experimentId: 'exp' } });

        croctContent('home-banner@1', fallback);
        await Promise.resolve();
        await Promise.resolve();

        expect(croctFetch).toHaveBeenCalled();
        globalThis.window = undefined;
    });

    it('exposes no metadata before loading', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };
        const atom = croctContent('home-banner@1', fallback);

        expect(atom.value).toEqual({ stage: 'initial', content: fallback });
        expect(atom.value).not.toHaveProperty('metadata');
    });

    it('keeps loaded content when refresh fails', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };
        const loaded = { title: 'Hola' };
        const metadata = { experimentId: 'exp-1' };

        croctFetch.mockResolvedValueOnce({ content: loaded, metadata });
        const atom = croctContent('home-banner@1', fallback);
        await atom.refresh();

        croctFetch.mockRejectedValueOnce(new Error('boom'));
        await atom.refresh();

        expect(atom.value).toEqual({ stage: 'loaded', content: loaded, metadata });
    });

    it('moves to fallback when refresh fails before any load', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };

        croctFetch.mockRejectedValueOnce(new Error('boom'));
        const atom = croctContent('home-banner@1', fallback);
        await atom.refresh();

        expect(atom.value).toEqual({ stage: 'fallback', content: fallback });
    });

    it('uses persistent storage when timeout is not set', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };

        croctContent('home-banner@1', fallback);

        expect(persistMocks.persistentAtom).toHaveBeenCalledWith(
            'croct-nano|home-banner@1',
            { stage: 'initial', content: fallback },
            { encode: JSON.stringify, decode: JSON.parse },
        );
    });

    it('hydrates from persistent storage when available', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };
        const persistedState = {
            stage: 'loaded',
            content: { title: 'Persisted' },
            metadata: {
                experimentId: 'exp-99',
            },
        };

        persistMocks.persistentAtom.mockImplementationOnce(() => createAtom(persistedState));

        const atom = croctContent('home-banner@1', fallback);

        expect(atom.value).toEqual(persistedState);
    });

    it('uses ephemeral storage when timeout is set', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        const fallback = { title: 'Welcome' };

        const atom = croctContent('home-banner@1', fallback, { timeout: 3000 });

        expect(persistMocks.persistentAtom).not.toHaveBeenCalled();
        expect(atom.value).toEqual({ stage: 'initial', content: fallback });
    });
});

describe('auto-refresh plugin', () => {
    beforeEach(() => {
        vi.resetModules();
        croctExtend.mockClear();
    });

    it('registers auto-refresh plugin on import', async () => {
        await import('../src/index.js');

        expect(croctExtend).toHaveBeenCalledWith('auto-refresh-atom', expect.any(Function));
    });

    it('refreshes active atoms in a three-step cascade', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        await import('../src/index.js');
        const fallback = { title: 'Welcome' };
        croctFetch.mockResolvedValue({ content: fallback, metadata: { experimentId: 'exp' } });
        const atom = croctContent('home-banner@1', fallback);
        const refreshSpy = vi.spyOn(atom, 'refresh');

        const unsubscribe = atom.listen(() => undefined);
        atom._onMount?.();
        const tracker = croctExtend.mock.results[0]?.value as {
            emit: (type: string) => void;
        };

        tracker.emit('userSignedIn');

        await advanceTimers(500);
        expect(refreshSpy).toHaveBeenCalledTimes(1);

        await advanceTimers(1000);
        expect(refreshSpy).toHaveBeenCalledTimes(2);

        await advanceTimers(1500);
        expect(refreshSpy).toHaveBeenCalledTimes(3);

        unsubscribe();
        refreshSpy.mockRestore();
    });

    it('debounces refresh cascades when events repeat quickly', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        await import('../src/index.js');
        const fallback = { title: 'Welcome' };
        croctFetch.mockResolvedValue({ content: fallback, metadata: { experimentId: 'exp' } });
        const atom = croctContent('home-banner@1', fallback);
        const refreshSpy = vi.spyOn(atom, 'refresh');

        const unsubscribe = atom.listen(() => undefined);
        atom._onMount?.();
        const tracker = croctExtend.mock.results[0]?.value as {
            emit: (type: string) => void;
        };

        tracker.emit('userSignedIn');
        await advanceTimers(200);
        tracker.emit('userSignedIn');

        await advanceTimers(499);
        expect(refreshSpy).not.toHaveBeenCalled();

        await advanceTimers(1);
        expect(refreshSpy).toHaveBeenCalledTimes(1);

        await advanceTimers(1000);
        expect(refreshSpy).toHaveBeenCalledTimes(2);

        await advanceTimers(1500);
        expect(refreshSpy).toHaveBeenCalledTimes(3);

        unsubscribe();
        refreshSpy.mockRestore();
    });

    it('ignores unrelated tracking events', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        await import('../src/index.js');
        const fallback = { title: 'Welcome' };
        croctFetch.mockResolvedValue({ content: fallback, metadata: { experimentId: 'exp' } });
        const atom = croctContent('home-banner@1', fallback);
        const refreshSpy = vi.spyOn(atom, 'refresh');

        const unsubscribe = atom.listen(() => undefined);
        atom._onMount?.();
        const tracker = croctExtend.mock.results[0]?.value as {
            emit: (type: string) => void;
        };

        tracker.emit('pageViewed');
        await advanceTimers(2000);

        expect(refreshSpy).not.toHaveBeenCalled();

        unsubscribe();
        refreshSpy.mockRestore();
    });

    it('refreshes only mounted atoms', async () => {
        const { croctContent } = await import('../src/croctAtom.js');
        await import('../src/index.js');
        const fallback = { title: 'Welcome' };
        croctFetch.mockResolvedValue({ content: fallback, metadata: { experimentId: 'exp' } });
        const mountedAtom = croctContent('home-banner@1', fallback);
        const unmountedAtom = croctContent('home-banner@1', fallback);
        const mountedSpy = vi.spyOn(mountedAtom, 'refresh');
        const unmountedSpy = vi.spyOn(unmountedAtom, 'refresh');

        const unsubscribe = mountedAtom.listen(() => undefined);
        mountedAtom._onMount?.();
        const tracker = croctExtend.mock.results[0]?.value as {
            emit: (type: string) => void;
        };

        tracker.emit('userSignedIn');
        await advanceTimers(500);

        expect(mountedSpy).toHaveBeenCalledTimes(1);
        expect(unmountedSpy).not.toHaveBeenCalled();

        unsubscribe();
        mountedSpy.mockRestore();
        unmountedSpy.mockRestore();
    });
});
