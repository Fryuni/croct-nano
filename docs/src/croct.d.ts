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

    import { JsonObject } from '@croct/json';
    import { CanonicalVersionId, Version, Versioned, VersionedId } from '@croct/plug/versioning';
    import { ComponentContent, ComponentVersionId } from '@croct/plug/component';
    export interface SlotMap {}
    /**
     * Creates an intersection of the given types distributing over unions.
     *
     * The difference between this type and the built-in `&` operator is that the
     * `&` operator creates an intersection of the union members instead of
     * creating a union of the intersection members. For example, given the types
     * `Left = A | B` and `Right = C`, the type `Left & Right` expands to
     * `(A | B) & C`, but `Merge<Left, Right>` expands to `A & C | B & C`,
     * which improves type inference when narrowing the type.
     */
    type Intersection<T, E> = T extends infer O ? O & E : never;
    type UnionContent<T = null> = {
        [K in ComponentVersionId]: Intersection<
            ComponentContent<K>,
            {
                _component: K | T;
            }
        >;
    };
    type UnknownContent = UnionContent[ComponentVersionId] extends never
        ? JsonObject & {
              _component: string | null;
          }
        : UnionContent[ComponentVersionId];
    type VersionedContent<I extends VersionedSlotId> = Versioned<
        I,
        VersionedSlotMap,
        UnknownContent
    >;
    export type DynamicSlotId = any;
    export type SlotId = keyof VersionedSlotMap extends never ? string : keyof VersionedSlotMap;
    export type SlotVersion<I extends SlotId> = Version<VersionedSlotMap, I>;
    export type SlotVersionId<I extends SlotId = SlotId> = CanonicalVersionId<I, VersionedSlotMap>;
    export type VersionedSlotId<I extends SlotId = SlotId> = VersionedId<I, VersionedSlotMap>;
    export type CompatibleSlotContent<T extends ComponentVersionId = ComponentVersionId> =
        UnionContent<never>[T];
    export type SlotContent<
        I extends VersionedSlotId = VersionedSlotId,
        C extends JsonObject = JsonObject,
    > = JsonObject extends C ? (string extends I ? UnknownContent : VersionedContent<I>) : C;
}
