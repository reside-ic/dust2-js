import array from "@stdlib/ndarray/array";
import ndarray2array from "@stdlib/ndarray/to-array";
import MultiSlice from "@stdlib/slice/multi";
import Slice from "@stdlib/slice/ctor";
import slice from "@stdlib/ndarray/slice";
import {ndarray} from "@stdlib/types/ndarray";
import {prod, shapeSlice} from "./utils";

type PackerShape = Map<string, number[]>;

// Unpack results return numbers for scalar values and ndarray for everything else, including 1D arrays
export type UnpackResult = Map<string, number | ndarray>;

// This options type currently only defines the shapes of the unpacked values, but we expect to add other options later
export interface PackerOptions {
    // Mapping of packed value names to their unpacked shape. Scalars are represented by empty array.
    shape: PackerShape
}

const validateShape = (name: string, shape: number[]) => {
    const nonInteger = shape.find((v) => !Number.isInteger(v));
    if (nonInteger !== undefined) {
        throw Error("All dimension values must be integers, but this is not the case for " +
                    `${name}, whose value is ${JSON.stringify(shape)}.`);
    }
    const lessThanZero = shape.find((v) => v <= 0);
    if (lessThanZero !== undefined) {
        throw Error("All dimension values must be at least 1, but this is not the case for " +
                    `${name}, whose value is ${JSON.stringify(shape)}.`);
    }
}

// interface describing the range of indexes for a named value group in the underlying array
interface IndexValues {
    start: number,
    length: number
}

export class Packer {
    public readonly len: number; // Total number of values
    private readonly  idx: Record<string, IndexValues>; // Maps value names to starting index and length in packed data
    private readonly shape: PackerShape

    constructor(options: PackerOptions) {
        this.idx = {};
        this.shape = options.shape;
        this.len = 0;
        for (const [name, value] of this.shape) {
            validateShape(name, value);
            const n = prod(value); // total number of values in this shape
            this.idx[name] = { start: this.len, length: n }
            this.len += n;
        }

        if (!this.len) {
            throw Error("Trying to generate an empty packer. You have not provided any entries in 'shape', " +
                        "which implies generating from a zero-length parameter vector.");
        }
    }

    private isScalar(name: string) {
        return this.shape.get(name)?.length === 0;
    }

    public unpackArray(x: Array<number>): UnpackResult {
        if (x.length !== this.len) {
            throw Error(`Incorrect length input; expected ${this.len} but given ${x.length}.`);
        }

        // Return a map of names to values in the format described by shape
        const result = new Map<string, number | ndarray>();
        for (const [name, currentShape] of this.shape) {
            const {start, length} = this.idx[name];
            if (this.isScalar(name)) {
                result.set(name, x[start])
            } else {
                const values = x.slice(start, start + length);
                result.set(name, array(values, { shape: currentShape }))
            }
        }
        return result;
    }

    public unpackNdarray(x: ndarray): UnpackResult {
        const xShape = x.shape;
        if (xShape[0] !== this.len) {
            throw Error(`Incorrect length input; expected ${this.len} but given ${xShape[0]}.`);
        }

        // If this ndarray is one dimensional, call unpackArray, so we return numbers for the scalar values
        if (x.shape.length === 1) {
            return this.unpackArray(ndarray2array(x));
        }

        // all dimensions except the first one as nulls - get all value for those dims
        const residualNullDimensions = new Array(xShape.length -1).fill(null);
        const residualDimensions = shapeSlice(xShape, 1); // all dimensions except the first one

        // Return a map of names to values in the format described by shape
        const result = new Map<string, ndarray>();
        for (const [name, currentShape] of this.shape) {
            const { start, length } = this.idx[name];

            // Take the correct slice of the input ndarray, and reshape
            const scalar = this.isScalar(name);
            const inputSlice = scalar ? new Slice(start, start + 1) : new Slice(start, start + length);
            const resultShape = scalar ? residualDimensions : [...currentShape, ...residualDimensions];
            const values = slice(x, new MultiSlice(inputSlice, ...residualNullDimensions));
            const flatVals = ndarray2array(values);
            result.set(name, array(flatVals, {shape: resultShape}))
        }

        return result;
    }
}
