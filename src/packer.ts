import * as ndarray from "ndarray";

const preparePackArrayForShape = (name: string, shape: number | number[] | null) => {
    // For a given shape and base name, return packed names, shape and n (number of values after expansion
    const scalar = shape === null || shape === [];
    if (scalar) {
        return { names: [name], shape: 0, n: 1 };
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

    // names contains string representing R-style index accessors for all values in an array described by shape
    //- calculate these recursively
    const getIndexStrings = (prevDimIndexString: string, dimension: number) => {
        const result = [];
        const isLastDim = dimension == arrayShape.length - 1;
        for (let i = 1; i <= arrayShape[dimension]; i++) {
            const sep = prevDimIndexString.length ? "," : "";
            const thisDimPart = `${prevDimIndexString}${sep}${i}`;
            if (isLastDim) {
                result.push(thisDimPart);
            } else {
                result.push(...getIndexStrings(thisDimPart, dimension + 1));
            }
        }
        return result;
    };
    const indexStrings = getIndexStrings("", 0);

    return {
        names: indexStrings.map(s =>  `${name}[${s}]`),
        shape: arrayShape,
        n: indexStrings.length
    }
}

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

export class Packer {
    private options: Partial<PackerOptions>;
    private len: number;
    private nms: Array<string>;
    private idx: object; // TODO: fix up type
    private shape: object; // TODO: fix up type

    constructor(options: Partial<PackerOptions>) {
        this.options = options;

        this.nms = [];
        this.idx = {}; // For each value name, the index where their values are to be found in the packed array. 0 indexed!
        this.shape = {}; // For each value name, their shape - size of each dimension

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
                this.idx[name] = i;
            });
            this.nms.push(...scalar);
        }

        this.len = scalar?.size || 0;
        if (array) {
            for (let [name, value] of array) {
                const tmp = preparePackArrayForShape(name, value);
                this.nms.push(...tmp.names);
                this.shape[name] = tmp.shape;
                // array of 0-based indexes where each of the named values can be found
                this.idx[name] = [...Array(tmp.n).keys()].map(i => this.len + i);
                this.len = this.len + tmp.n;
            }
        }

        if (!this.len) {
            throw Error("Trying to generate an empty packet. You have not provided any entries in 'scalar' or 'array', " +
                        "which implies generating from a zero-length parameter vector.");
        }
    }

    // Unpack a one-dimensional array
    public unpack(x: Array<number>) {
        if (x.length !== this.len) {
            throw Error(`Incorrect length input; expected ${this.len} but given ${x.length}.`);
        }

        // Return a map of names to values in the format described by shape
        let result = new Map<string, any>();
        for (let name in this.shape) {
            if (this.shape[name] === [0]) {
                // scalar
                const i = this.idx[name] as number;
                result.set(name, x[i])
            } else {
                // array
                const startIdx = this.idx[name][0];
                const length = this.idx[name].length;
                const values = x.slice(startIdx, startIdx + length -1);
                if (this.shape[name].length == 1) {
                    // one-dimensional array
                    result.set(name, values);
                } else {
                    // multi-dimensional array
                    result.set(name, ndarray(values, this.shape[name]))
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
}