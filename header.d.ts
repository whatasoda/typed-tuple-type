/* header.d.ts */
type Placeholder = Omit<[[]], keyof any[]>;
interface Tuples extends Placeholder {}

type KeyToPick = Exclude<keyof Tuples, keyof any[]>;
type Numerify<T extends any[]> = { [I in keyof T]: number };

type NumTuplesTmp<T extends Record<KeyToPick, any[]>> = {
  [I in keyof T]: T[I] extends number[] ? Pick<Numerify<T[I]>, Extract<keyof T[I], KeyToPick> | 'length'> : [];
};

export interface NumericTuples extends Omit<NumTuplesTmp<Tuples>, keyof any[]> {}
export type TupleLength = NumericTuples[keyof NumericTuples]['length'];
export type S2N<T extends keyof NumericTuples> = NumericTuples[T]['length'];
export type N2S<T extends TupleLength> = {
  [K in keyof NumericTuples]: NumericTuples[K]['length'] extends T ? K : never;
}[keyof NumericTuples];
/* End of header.d.ts */
