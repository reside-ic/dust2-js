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
    private nms: Array<string>;
    private idx: object;
    private shape: object;

    constructor(options: Partial<PackerOptions>) {
        this.options = options;

        this.nms = [];
        this.idx = {}; // For each value name, the index where their values are to be found in the packed array
        this.shape = {}; // For each value name, their shape - size of each dimension

        const { scalar, array } = options;

        if (scalar) {
            scalar.forEach((name, i) => {
                // for each scalar, shape gets an array with a single integer in it, set to 0 (indicating no dimensions)
                this.shape[name] = [0];
                // .. and index gets the index where they can be found
                this.idx[name] = i;
            });
            this.nms.push(...scalar);
        }

        let len = scalar?.size || 0;
        if (array) {
            for (let [name, value] of array) {
                const tmp = preparePackArrayForShape(name, value)
            }
        }
    }

    private static preparePackArrayForShape(name: string, shape: number | number[] | null) {
        // For a given shape and base name, return packed names, shape and n (number of values after expansion
        const scalar = shape === null || shape === [];
        if (scalar) {
            return { names: [name], shape: 0, n: 1 };
        }
        const arrayShape = typeof shape === "number" ? [shape] : shape;
        const nonInteger = arrayShape.find((v) => !Number.isInteger(v))
        if (nonInteger) {
            throw Error(`All dimension values in 'array" elements must be integers, but this is not the case for ${name}, whose` +
                        ` value is ${JSON.stringify(shape)}`);
        }
        const lessThanZero = arrayShape.find((v) => v <= 0);
        if (lessThanZero) {
            throw Error(`All dimension values in 'array' must be at least 1, but this is not the case for ${name}, whose ` +
                        ` value is ${JSON.stringify(shape)}`);
        }
    }
}