import ndarray from "ndarray";
import { particleStateToArray, prod } from "./utils";
import { ParticleState } from "./SystemState.ts";

/**
 * Type defining the unpacked shape for a {@link Packer} where value names are mapped to a number[] defining the size
 * of each dimension.
 */
export type PackerShape = Map<string, number[]>;

/**
 * Result for {@link Packer}'s unpack results, which provide numbers for scalar values and ndarray for everything else,
 * including one-dimensional arrays
 */
export type UnpackResult = Map<string, number | ndarray.NdArray>;

// This options type currently only defines the shapes of the unpacked values, but we expect to add other options later
/**
 * Type defining options for the {@link Packer} class
 */
export interface PackerOptions {
    /**
     * Mapping of packed value names to their unpacked shape (as an array of numbers). Scalars are represented by an
     * empty array.
     */
    shape: PackerShape;
}

const validateShape = (name: string, shape: number[]) => {
    const nonInteger = shape.find((v) => !Number.isInteger(v));
    if (nonInteger !== undefined) {
        throw Error(
            "All dimension values must be integers, but this is not the case for " +
                `${name}, whose value is ${JSON.stringify(shape)}.`
        );
    }
    const lessThanZero = shape.find((v) => v <= 0);
    if (lessThanZero !== undefined) {
        throw Error(
            "All dimension values must be at least 1, but this is not the case for " +
                `${name}, whose value is ${JSON.stringify(shape)}.`
        );
    }
};

// interface describing the range of indexes for a named value group in the underlying array
interface IndexValues {
    start: number;
    length: number;
}

/**
 * Class which can pack multiple values which may have multiple dimensions into a one-dimensional array of values,
 * and unpack them again.
 */
export class Packer {
    private readonly _length: number; // Total number of values
    private readonly _idx: Record<string, IndexValues>; // Maps value names to starting index and length in packed data
    private readonly _shape: PackerShape;

    /**
     *
     * @param options Packing options for the Packer
     */
    constructor(options: PackerOptions) {
        this._idx = {};
        this._shape = options.shape;
        this._length = 0;
        for (const [name, value] of this._shape) {
            validateShape(name, value);
            const n = prod(value); // total number of values in this shape
            this._idx[name] = { start: this._length, length: n };
            this._length += n;
        }

        if (!this._length) {
            throw Error(
                "Trying to generate an empty packer. You have not provided any entries in 'shape', " +
                    "which implies generating from a zero-length parameter vector."
            );
        }
    }

    /**
     * Returns the total number of values which will be held in a one-dimensional array after packing by this Packer.
     */
    public get length() {
        return this._length;
    }

    private isScalar(name: string) {
        return this._shape.get(name)?.length === 0;
    }

    /**
     * Slices array based on numbers of variables while respecting the the length of each variables.
     * @param x A number array corresponding to the shape this class was initialised with.
     * @param nVariables Number of variables to include in the slice
     */
    public sliceArray(x: Array<number>, nVariables: number) {
        if (x.length > this.length) {
            throw Error(
                `The given array's length ${x.length} is larger than max size of flat array ` +
                    `this packer supports (${this.length}).`
            );
        }
        if (nVariables > this._shape.size) {
            throw Error(
                `nVariables (${nVariables}) cannot be larger than total number of ` + `variables ${this._shape.size}.`
            );
        }

        const key = Array.from(this._shape.keys())[nVariables - 1];
        const { start, length } = this._idx[key];
        const sliceEnd = start + length;
        return x.slice(0, sliceEnd);
    }

    /**
     * Unpacks a one-dimensional array to the shapes defined by this Packer.
     * @param x A standard number array
     */
    public unpackArray(x: Array<number>): UnpackResult {
        if (x.length !== this._length) {
            throw Error(`Incorrect length input; expected ${this._length} but given ${x.length}.`);
        }

        // Return a map of names to values in the format described by shape
        const result = new Map<string, number | ndarray.NdArray>();
        for (const [name, currentShape] of this._shape) {
            const { start, length } = this._idx[name];
            if (this.isScalar(name)) {
                result.set(name, x[start]);
            } else {
                const values = x.slice(start, start + length);
                result.set(name, ndarray(values, currentShape));
            }
        }
        return result;
    }

    /**
     * Unpacks an {@link https://github.com/scijs/ndarray | NdArray } to the shapes defined by this Packer.
     * We require the first dimension in the NdArray to equal {@link Packer.length | length}. Any additional
     * dimensions are added to the configured shapes for each unpacked value.
     *
     * @param x NdArray of numbers
     */
    public unpackNdarray(x: ndarray.NdArray): UnpackResult {
        const xShape = x.shape;
        const xLength = xShape[0];
        if (xLength !== this._length) {
            throw Error(`Incorrect length input; expected ${this._length} but given ${xLength}.`);
        }

        // If this NdArray is one dimensional, call unpackArray, so we return numbers for the scalar values
        if (xShape.length === 1) {
            // Because this is a 1D NdArray we can treat it like a ParticleState, and pull its values out to an array
            const xArray = particleStateToArray(x as ParticleState);
            return this.unpackArray(xArray);
        }

        // all dimensions except the first one as nulls - get all value for those dims
        const residualNullDimensions = new Array(xShape.length - 1).fill(null);
        const residualDimensions = xShape.slice(1); // all dimensions except the first one

        // Return a map of names to values in the format described by shape
        const result = new Map<string, ndarray.NdArray>();
        for (const [name, currentShape] of this._shape) {
            const { start, length } = this._idx[name];

            const scalar = this.isScalar(name);

            // Take the correct slice of the input ndarray
            let sliced: ndarray.NdArray;
            if (scalar) {
                sliced = x.pick(start, ...residualNullDimensions);
            } else {
                // We take a slice from the ndarray by doing a low then a high truncate - so the high truncate value
                // (from the end of the array) is the underlying length - (slice start + slice length)
                const hiTrunc = xLength - (start + length);
                sliced = x.lo(start, ...residualNullDimensions).hi(hiTrunc, ...residualNullDimensions);
            }

            const resultShape = scalar ? residualDimensions : [...currentShape, ...residualDimensions];

            // Reshape the sliced array - leave stride undefined to use default
            const unpacked = ndarray(sliced.data, resultShape, undefined, sliced.offset);
            result.set(name, unpacked);
        }

        return result;
    }
}
