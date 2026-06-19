type Def$727d6ed5 = {
    /**
     * Body
     *
     * Some text to be used in the example. Can be a lorem ipsum.
     */
    body?: string;
    /**
     * Title
     *
     * A title within the example demonstration.
     */
    title: string;
};

type ExampleV1 = Def$727d6ed5 & { _component: 'example-component@1' | null };

declare module '@croct/plug/slot' {
    export interface VersionedSlotMap {
        example: {
            latest: ExampleV1;
            '1': ExampleV1;
        };
    }
}
