/* header.d.ts */
type Placeholder = Omit<[[], [0]], keyof any[]>;
interface Tuples extends Placeholder {}

type Numerify<T extends any[]> = { [I in keyof T]: number };
export type NumericTuples = {
  [I in Exclude<keyof Tuples, keyof any[]>]: Omit<Numerify<Tuples[I]>, keyof any[]>;
};
export type TupleLength = Tuples[keyof NumericTuples]['length'];
export type S2N<T extends keyof NumericTuples> = Tuples[T]['length'];
export type N2S<T extends TupleLength> = {
  [K in keyof NumericTuples]: Tuples[K]['length'] extends T ? K : never;
}[keyof NumericTuples];
/* End of header.d.ts */
