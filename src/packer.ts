import array from "@stdlib/ndarray/array";
import ndarray2array from "@stdlib/ndarray/to-array";
import MultiSlice from "@stdlib/slice/multi";
import Slice from "@stdlib/slice/ctor";
import slice from "@stdlib/ndarray/slice";
import {ndarray} from "@stdlib/types/ndarray";

export interface PackerOptions {
    // names of scalar values
    scalar: Set<string>,

    // mapping of array value names to their length. Arrays may be multi-dimensional so the value of the map may be an
    // array containing lengths of each dimension. 0 or null values are counted as scalars, which allows you to put
    // scalars at positions other than the front of the packing vector.
    array: Map<string, number | number[] | null>,

    // mapping of fixed data names to values
    fixed: Map<string, any>,

    // custom function to do additional unpacking logic on the unpacked map
    process: (unpacked: Map<string, any>) => Map<string, any>
}

// For a given shape and base name, return packed shape and n (number of values after expansion
const preparePackArrayForShape = (name: string, shape: number | Int32Array| null) => {
    // Scalars can be defined within the array option, if that allows user's preferred ordering
    const scalar = shape === null || (Array.isArray(shape) && shape.length === 0);
    if (scalar) {
        return { names: [name], shape: [0], n: 1 };
    }
    const arrayShape: Array<number> = typeof shape === "number" ? [shape] : shape;
    const nonInteger = arrayShape.find((v) => !Number.isInteger(v))
    if (nonInteger) {
        throw Error(`All dimension values in 'array' values must be integers, but this is not the case for ${name}, whose` +
            ` value is ${JSON.stringify(shape)}`);
    }
    const lessThanZero = arrayShape.find((v) => v <= 0);
    if (lessThanZero) {
        throw Error(`All dimension values in 'array' values must be at least 1, but this is not the case for ${name}, whose ` +
            ` value is ${JSON.stringify(shape)}`);
    }

    // total number of values in shape
    const n = arrayShape.reduce((prev, current) => prev * current, 1);

    return {
        shape: arrayShape,
        n
    }
}

// interface describing the range of indexes for a named value group in the underlying array
interface IndexValues {
    start: number,
    length: number
}

export class Packer {
    private options: Partial<PackerOptions>;
    private len: number; // Total number of values
    private idx: Record<string, IndexValues>;
    private shape: Record<string, Int32Array>; // shape of each named value group i.e. size of each dimension

    constructor(options: Partial<PackerOptions>) {
        this.options = options;

        this.idx = {};
        this.shape = {};

        const { scalar, array, fixed } = options;

        const allNames = [...(scalar || []), ...(array?.keys() || []), ...(fixed?.keys() || [])];
        // Check for duplicate names
        const dup = allNames.find((name, i) => allNames.lastIndexOf(name) !== i)
        if (dup) {
            // TODO: make a throw error util
            throw Error(`Names must be distinct between 'scalar', 'array' and 'fixed'. ${dup} appears in more than one place.`);
        }

        if (scalar) {
            Array.from(scalar).forEach((name, i) => {
                // for each scalar, shape gets an array with a single integer in it, set to 0 (indicating no dimensions)
                this.shape[name] = [0];
                // .. and index gets the index where they can be found
                this.idx[name] = { start: i, length: 1};
            });
        }

        this.len = scalar?.size || 0;
        if (array) {
            for (let [name, value] of array) {
                const tmp = preparePackArrayForShape(name, value);
                this.shape[name] = tmp.shape;
                // array of 0-based indexes where each of the named values can be found
                this.idx[name] = { start: this.len, length: tmp.n }
                this.len = this.len + tmp.n;
            }
        }

        if (!this.len) {
            throw Error("Trying to generate an empty packet. You have not provided any entries in 'scalar' or 'array', " +
                        "which implies generating from a zero-length parameter vector.");
        }
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
        let result = new Map<string, any>();
        for (let name in this.shape) {
            const currentShape = this.shape[name];
            if (Array.isArray(currentShape) && currentShape.length === 1 && currentShape[0] === 0) {
                // scalar
                const i = this.idx[name].start;
                result.set(name, x[i])
            } else {
                // array
                const {start, length} = this.idx[name];
                const values = x.slice(start, start + length);
                if (this.shape[name].length == 1) {
                    // one-dimensional array
                    result.set(name, values);
                } else {
                    // multi-dimensional array
                    result.set(name, array(values, { shape: this.shape[name] }))
                }
            }
        }

        const { fixed, process } = this.options;

        if (fixed) {
            Array(fixed.entries()).forEach((key, value) => {
                result[key] = value;
            });
        }

        if (process) {
            result = process(result);
        }

        return result;
    }

    public unpack_ndarray(x: ndarray) {
        if (x.shape[0] !== this.len) {
            throw Error(`Incorrect length input; expected ${this.len} but given ${x.shape[0]}.`);
        }

        // all dimensions except the first one as nulls - get all value for those dims
        const residualNullDimensions = new Array(x.shape.length -1).fill(null);
        const residualDimensions = x.shape.slice(1); // all dimensions except the first one

        // Return a map of names to values in the format described by shape
        let result = new Map<string, any>();
        for (let name in this.shape) {
            const currentShape = this.shape[name];
            const { start, length } = this.idx[name];
            if (Array.isArray(currentShape) && currentShape.length === 1 && currentShape[0] === 0) {
                // scalar
                const multiSlice = new MultiSlice(new Slice(start, start+1), ...residualNullDimensions);
                const values = slice(x, multiSlice);
                const flatVals = ndarray2array(values);
                result.set(name, array(flatVals, {shape: residualDimensions}))
            } else {
                // array
                // Take the correct slice of the input ndarray, and reshape
                const multiSlice = new MultiSlice(new Slice(start, start + length), ...residualNullDimensions);
                const values = slice(x, multiSlice);
                result.set(name, array(values, {shape: [...this.shape[name], ...residualDimensions]}))
            }
        }

        return result;
    }
}