import ndarray from "ndarray";
import { ParticleState } from "./SystemState.ts";
import { DustParameterError } from "./errors.ts";

// Product of all values in a number array
export const prod = (array: number[]) => array.reduce((prev, current) => prev * current, 1);

export const particleStateToArray = (state: ParticleState): number[] => {
    const len = state.size;
    const result = new Array<number>(len);
    for (let i = 0; i < len; i++) {
        result[i] = state.get(i);
    }
    return result;
};

export const checkIntegerInRange = (name: string, value: number, min: number, max?: number) => {
    if (!Number.isInteger(value) || value < min || (max !== undefined && value > max)) {
        const rangeMsg = max === undefined ? `greater than or equal to ${min}` : `between ${min} and ${max}`;
        throw RangeError(`${name} should be an integer ${rangeMsg}, but is ${value}.`);
    }
};

// Convert an array of arrays into an NdArray
export const ndArrayFrom = (source: number[][]): ndarray.NdArray => {
    if (source.length === 0) {
        throw new DustParameterError("Cannot convert from empty source");
    }
    const expectedLength = source[0].length;
    if (source.some((arr) => arr.length !== expectedLength)) {
        throw new DustParameterError("Source arrays must all be the same length");
    }

    const values = source.reduce((acc, current) => {
        acc.push(...current);
        return acc;
    }, [] as number[]);
    return ndarray(values, [source.length, expectedLength]);
};

const floatingPointTolerance = 1e-12;

export const floatIsDivisibleBy = (a: number, b: number) => {
    const isAlmostZero = a % b < floatingPointTolerance;
    const isAlmostB = b - (a % b) < floatingPointTolerance;
    return isAlmostZero || isAlmostB;
};
