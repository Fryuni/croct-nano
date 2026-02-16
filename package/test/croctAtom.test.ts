import './bun.setup';
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    mock,
    vi,
} from 'bun:test';

const persistMocks = {
    persistentAtom: vi.fn(),
};

const croctFetch = vi.fn();
const testGlobal = globalThis as { window?: Window & typeof globalThis };

const croctExtend = vi.fn(
    (
        _name: string,
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
);

const nanoTask = (fn: () => Promise<void>) => fn();
const createAtom = (initial: unknown) => {
    const listeners = new Set<() => void>();
    let unmount: (() => void) | undefined;
    const store = {
        value: initial,
        set: (value: unknown) => {
            store.value = value;
            for (const listener of listeners) {
                listener();
            }
        },
        listen: (listener: () => void) => {
            if (listeners.size === 0) {
                unmount = store._onMount?.();
            }
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    unmount?.();
                    unmount = undefined;
                }
            };
        },
        _listeners: listeners,
        _onMount: undefined as undefined | (() => () => void),
    };
    return store;
};

const originalWindow = testGlobal.window;

mock.module('@croct/plug', () => ({
    default: {
        fetch: croctFetch,
        extend: croctExtend,
    },
}));

mock.module('@nanostores/persistent', () => ({
    persistentAtom: persistMocks.persistentAtom,
}));

mock.module('nanostores', () => ({
    atom: createAtom,
    onMount: (store: { _onMount?: () => () => void }, handler: () => () => void) => {
        store._onMount = handler;
    },
    task: nanoTask,
}));

mock.module('@inox-tools/utils/nano', () => ({
    resolvedAtom: (value: { preferredLocale?: unknown; attributes?: unknown }) => ({
        get: () => ({
            preferredLocale: value.preferredLocale,
            attributes: value.attributes,
        }),
        subscribe: () => () => undefined,
    }),
}));

async function importFresh<T>(path: string): Promise<T> {
    return import(`${path}?test=${Math.random().toString(36).slice(2)}`) as Promise<T>;
}

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
        testGlobal.window = undefined;
        croctFetch.mockReset();
        persistMocks.persistentAtom.mockReset();
        croctExtend.mockClear();
        persistMocks.persistentAtom.mockImplementation((_key, initial) => createAtom(initial));
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    afterAll(() => {
        testGlobal.window = originalWindow;
        mock.restore();
    });

    it('starts with fallback content in initial stage', async () => {
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };
        const atom = croctContent('home-banner@1', fallback);

        expect(atom.value).toEqual({ stage: 'initial', content: fallback });
    });

    it('loads content and metadata on successful refresh', async () => {
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };
        const loaded = { _component: null, title: 'Hola' };
        const metadata = { experimentId: 'exp-1', version: '1' };

        croctFetch.mockResolvedValue({ content: loaded, metadata });

        const atom = croctContent('home-banner@1', fallback);
        await atom.refresh();

        expect(croctFetch).toHaveBeenCalledWith('home-banner@1', {
            attributes: undefined,
            preferredLocale: undefined,
        });
        expect(atom.value).toEqual({ stage: 'loaded', content: loaded, metadata });
    });

    it('auto-refreshes on creation in browser environments', async () => {
        testGlobal.window = {} as Window & typeof globalThis;
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };
        croctFetch.mockResolvedValue({
            content: fallback,
            metadata: { experimentId: 'exp', version: '1' },
        });

        croctContent('home-banner@1', fallback);
        await Promise.resolve();
        await Promise.resolve();

        expect(croctFetch).toHaveBeenCalled();
        testGlobal.window = undefined;
    });

    it('exposes no metadata before loading', async () => {
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };
        const atom = croctContent('home-banner@1', fallback);

        expect(atom.value).toEqual({ stage: 'initial', content: fallback });
        expect(atom.value).not.toHaveProperty('metadata');
    });

    it('keeps loaded content when refresh fails', async () => {
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };
        const loaded = { _component: null, title: 'Hola' };
        const metadata = { experimentId: 'exp-1', version: '1' };
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        croctFetch.mockResolvedValueOnce({ content: loaded, metadata });
        const atom = croctContent('home-banner@1', fallback);
        await atom.refresh();

        croctFetch.mockRejectedValueOnce(new Error('boom'));
        await atom.refresh();

        expect(atom.value).toEqual({ stage: 'loaded', content: loaded, metadata });
        expect(consoleError).toHaveBeenCalledWith(
            expect.stringContaining('Error while refreshing Croct Atom for "home-banner@1"'),
            expect.any(Error),
        );
        consoleError.mockRestore();
    });

    it('moves to fallback when refresh fails before any load', async () => {
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        croctFetch.mockRejectedValueOnce(new Error('boom'));
        const atom = croctContent('home-banner@1', fallback);
        await atom.refresh();

        expect(atom.value).toEqual({ stage: 'fallback', content: fallback });
        expect(consoleError).toHaveBeenCalledWith(
            expect.stringContaining('Error while refreshing Croct Atom for "home-banner@1"'),
            expect.any(Error),
        );
        consoleError.mockRestore();
    });

    it('uses persistent storage when timeout is not set', async () => {
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };

        croctContent('home-banner@1', fallback);

        expect(persistMocks.persistentAtom).toHaveBeenCalledWith(
            'croct-nano|home-banner@1',
            { stage: 'initial', content: fallback },
            { encode: JSON.stringify, decode: JSON.parse },
        );
    });

    it('hydrates from persistent storage when available', async () => {
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };
        const persistedState = {
            stage: 'loaded',
            content: { _component: null, title: 'Persisted' },
            metadata: {
                experimentId: 'exp-99',
                version: '1',
            },
        } as const;

        persistMocks.persistentAtom.mockImplementationOnce(() => createAtom(persistedState));

        const atom = croctContent('home-banner@1', fallback);

        expect(atom.value).toEqual(persistedState);
    });

    it('uses ephemeral storage when timeout is set', async () => {
        const { croctContent } =
            await importFresh<typeof import('../src/croctAtom.js')>('../src/croctAtom.js');
        const fallback = { _component: null, title: 'Welcome' };

        const atom = croctContent('home-banner@1', fallback, { timeout: 3000 });

        expect(persistMocks.persistentAtom).not.toHaveBeenCalled();
        expect(atom.value).toEqual({ stage: 'initial', content: fallback });
    });
});

describe('auto-refresh plugin', () => {
    let croctContent: typeof import('../src/croctAtom.js').croctContent;

    beforeAll(async () => {
        await importFresh('../src/index.js');
        ({ croctContent } = await import('../src/croctAtom.js'));
    });

    beforeEach(() => {
        croctFetch.mockReset();
    });

    it('registers auto-refresh plugin on import', async () => {
        expect(croctExtend).toHaveBeenCalledWith('auto-refresh-atom', expect.any(Function));
    });

    it('exposes no-op plugin lifecycle methods', async () => {
        const pluginFactory = croctExtend.mock.calls[0]?.[1] as
            | ((args: { sdk: { tracker: { addListener: (listener: Function) => void } } }) => {
                  enable: () => void;
                  disable: () => void;
              })
            | undefined;

        const tracker = {
            addListener: (_listener: Function) => undefined,
        };

        const plugin = pluginFactory?.({ sdk: { tracker } });

        expect(plugin).toBeDefined();
        expect(() => plugin?.enable()).not.toThrow();
        expect(() => plugin?.disable()).not.toThrow();
    });

    it('refreshes active atoms in a three-step cascade', async () => {
        const fallback = { _component: null, title: 'Welcome' };
        croctFetch.mockResolvedValue({
            content: fallback,
            metadata: { experimentId: 'exp', version: '1' },
        });
        const atom = croctContent('home-banner@1', fallback);
        const refreshSpy = vi.spyOn(atom, 'refresh');

        const unsubscribe = atom.listen(() => undefined);
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
        const fallback = { _component: null, title: 'Welcome' };
        croctFetch.mockResolvedValue({
            content: fallback,
            metadata: { experimentId: 'exp', version: '1' },
        });
        const atom = croctContent('home-banner@1', fallback);
        const refreshSpy = vi.spyOn(atom, 'refresh');

        const unsubscribe = atom.listen(() => undefined);
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
        const fallback = { _component: null, title: 'Welcome' };
        croctFetch.mockResolvedValue({
            content: fallback,
            metadata: { experimentId: 'exp', version: '1' },
        });
        const atom = croctContent('home-banner@1', fallback);
        const refreshSpy = vi.spyOn(atom, 'refresh');

        const unsubscribe = atom.listen(() => undefined);
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
        const fallback = { _component: null, title: 'Welcome' };
        croctFetch.mockResolvedValue({
            content: fallback,
            metadata: { experimentId: 'exp', version: '1' },
        });
        const mountedAtom = croctContent('home-banner@1', fallback);
        const unmountedAtom = croctContent('home-banner@1', fallback);
        const mountedSpy = vi.spyOn(mountedAtom, 'refresh');
        const unmountedSpy = vi.spyOn(unmountedAtom, 'refresh');

        const unsubscribe = mountedAtom.listen(() => undefined);
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
