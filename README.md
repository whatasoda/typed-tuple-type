[![npm version](https://badge.fury.io/js/typed-tuple-type.svg)](https://badge.fury.io/js/typed-tuple-type)
# typed-tuple-type
a type utility to apply tuple feature to TypedArray such as Float32Array in TypeScript context

## What is `typed-tuple-type`
```ts
const vector3 = new Float32Array(3);
vector[0]; // OK
vector[1]; // OK
vector[2]; // OK
vector[3]; // Error

let vector2: Float32Tuple<2>;
vector2 = new Float32Array(1); // Error
vector2 = new Float32Array(2); // OK
vector2 = new Float32Array(3); // OK
```

## Installation

```sh
npm i -D typed-tuple-type
```

### `tsconfig.json`
To load `typed-tuple-type`, add `"node_modules/typed-tuple-type"` to `typeRoots` in your `tsconfig.json`
```js
{
  "compilerOptions": {
    "typeRoots": [
      "node_modules/@types",
      "node_modules/typed-tuple-type"
    ]
  },
}
```
