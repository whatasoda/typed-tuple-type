/* header.d.ts */
type Placeholder = Omit<[[]], keyof any[]>;
interface Tuples extends Placeholder {}

type KeyToPick = Exclude<keyof Tuples, keyof any[]>;
type Numerify<T extends any[]> = { [I in keyof T]: number };

type NumTuplesTmp<T extends Record<KeyToPick, any[]>> = {
  [I in keyof T]: T[I] extends number[] ? Pick<Numerify<T[I]>, Extract<keyof T[I], KeyToPick> | 'length'> : [];
};

export interface NumericTuples extends Omit<NumTuplesTmp<Tuples>, keyof any[]> {}

declare global {
  type OneOfSupportedLength = NumericTuples[keyof NumericTuples]['length'];
  type S2N<T extends keyof NumericTuples> = NumericTuples[T]['length'];
  type N2S<T extends OneOfSupportedLength> = {
    [K in keyof NumericTuples]: NumericTuples[K]['length'] extends T ? K : never;
  }[keyof NumericTuples];
}
/* End of header.d.ts */
