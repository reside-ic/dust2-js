import array from "@stdlib/ndarray/array";
import ndarray2array from "@stdlib/ndarray/to-array";
import MultiSlice from "@stdlib/slice/multi";
import Slice from "@stdlib/slice/ctor";
import slice from "@stdlib/ndarray/slice";
import {ndarray} from "@stdlib/types/ndarray";
import { prod } from "./utils";

type PackerShape = Map<string, number[]>;

// This option type currently only defines the shapes of the unpacked values, but we expect to add other options later
export interface PackerOptions {
    // Mapping of packed value names to their unpacked shape. Scalars are represented by empty array.
    shape: PackerShape
}

const validateShape = (name: string, shape: number |  number[] | null) => {
    // Scalars can be defined within the array option, if that allows user's preferred ordering
    const scalar = shape === null || (Array.isArray(shape) && shape.length === 0);
    if (scalar) {
        return { shape: [0], n: 1 };
    }
    const arrayShape: Array<number> = typeof shape === "number" ? [shape] : shape;
    const nonInteger = arrayShape.find((v) => !Number.isInteger(v))
    if (nonInteger) {
        throw Error("All dimension values in 'array' values must be integers, but this is not the case for " +
                    `${name}, whose value is ${JSON.stringify(shape)}`);
    }
    const lessThanZero = arrayShape.find((v) => v <= 0);
    if (lessThanZero) {
        throw Error("All dimension values in 'array' values must be at least 1, but this is not the case for " +
                    `${name}, whose value is ${JSON.stringify(shape)}`);
    }
}

// interface describing the range of indexes for a named value group in the underlying array
interface IndexValues {
    start: number,
    length: number
}

export class Packer {
    private len: number; // Total number of values
    private idx: Record<string, IndexValues>; // Maps value names to starting index and length in packed data
    private shape: PackerShape

    constructor(options: PackerOptions) {
        this.idx = {};
        this.shape = options.shape;

        this.len = 0;
        for (const [name, value] of this.shape) {
            validateShape(name, value);
            const n = prod(value); // total number of values in this shape
            this.idx[name] = { start: this.len, length: n }
            this.len = this.len + n;
        }

        if (!this.len) {
            throw Error("Trying to generate an empty packer. You have not provided any entries in 'shape', " +
                        "which implies generating from a zero-length parameter vector.");
        }
    }

    private isScalar(name: string) {
        return this.shape.get(name)?.length === 0;
    }

    // TODO: unpack_array and unpack_ndarray are currently separate methods, but could be combined as in the R
    // implementation.
    // TODO: The return types for these methods are a bit of a mess - handing back a combination of scalars, ordinary
    // array and ndarrays for the unpack_array method, ndarrays only for unpack_ndarray. We should probably EITHER
    // only return ndarrays for any array results OR always return oridinary arrays for 1D results.

    // Unpack a one-dimensional array
    public unpack_array(x: Array<number>) {
        if (x.length !== this.len) {
            throw Error(`Incorrect length input; expected ${this.len} but given ${x.length}.`);
        }

        // Return a map of names to values in the format described by shape
        const result = new Map<string, number | number[] | ndarray>();
        for (const [name, currentShape] of this.shape) {
            if (this.isScalar(name)) {
                const i = this.idx[name].start;
                result.set(name, x[i])
            } else {
                const {start, length} = this.idx[name];
                const values = x.slice(start, start + length);
                if (currentShape.length == 1) {
                    // one-dimensional array
                    result.set(name, values);
                } else {
                    // multi-dimensional array
                    result.set(name, array(values, { shape: currentShape }))
                }
            }
        }

        return result;
    }

    public unpack_ndarray(x: ndarray) {
        const xShape = x.shape as number[];
        if (xShape[0] !== this.len) {
            throw Error(`Incorrect length input; expected ${this.len} but given ${xShape[0]}.`);
        }

        // all dimensions except the first one as nulls - get all value for those dims
        const residualNullDimensions = new Array(xShape.length -1).fill(null);
        const residualDimensions = xShape.slice(1); // all dimensions except the first one

        // Return a map of names to values in the format described by shape
        const result = new Map<string, ndarray>();
        for (const [name, currentShape] of this.shape) {
            const { start, length } = this.idx[name];
            if (this.isScalar(name)) {
                // scalar
                const multiSlice = new MultiSlice(new Slice(start, start+1), ...residualNullDimensions);
                const values = slice(x, multiSlice);
                const flatVals = ndarray2array(values);
                result.set(name, array(flatVals, {shape: residualDimensions}))
            } else {
                // array
                // Take the correct slice of the input ndarray, and reshape
                const multiSlice = new MultiSlice(new Slice(start, start + length), ...residualNullDimensions);
                // TODO: sort out types
                const values = slice(x, multiSlice) as unknown as ArrayLike<number>;
                result.set(name, array(values, {shape: [...currentShape, ...residualDimensions]}))
            }
        }

        return result;
    }
}