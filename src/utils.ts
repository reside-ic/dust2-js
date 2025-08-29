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

export const checkIndicesForMax = (name: string, indices: number[], max: number) => {
    // Check an index array provided to setState is valid, with each value >= 0 and <= some max, and the whole list
    // being ordered and containing no duplicates
    for (let i = 0; i < indices.length; i++) {
        const indexValue = indices[i];
        checkIntegerInRange(name, indexValue, 0, max);
        if (i > 0 && indexValue <= indices[i - 1]) {
            throw new RangeError(`${name} indices must be ordered with no duplicates`);
        }
    }
};

export const checkNestedArrayLengthsMatch = (
    array: Array<unknown>,
    expectedLengths: number[],
    expectedLengthNames: string[],
    currentIndexes: number[] = []
) => {
    // Recursively check that a multidimensional array has the expected length for each member at every level, and throw
    // meaningful error if not
    if (expectedLengths.length !== expectedLengthNames.length) {
        throw new Error(
            "Unexpected parameters in checkNestedArrayLengthsMatch: " +
                "" +
                "expectedLengths and expectedLengthNames should be same length"
        );
    }
    if (array.length !== expectedLengths[0]) {
        const currentIndexesSuffix = currentIndexes.length ? ` at index ${currentIndexes}` : "";
        throw new RangeError(
            `${expectedLengthNames[0]} should have length ${expectedLengths[0]} ` +
                `but was ${array.length}${currentIndexesSuffix}`
        );
    }
    if (expectedLengths.length > 1) {
        const nextExpectedLengths = expectedLengths.slice(1);
        const nextExpectedLengthNames = expectedLengthNames.slice(1);
        for (let i = 0; i < array.length; i++) {
            const nestedArr = array[i] as Array<unknown>;
            const nestedCurrentIndexes = [...currentIndexes, i];
            checkNestedArrayLengthsMatch(nestedArr, nextExpectedLengths, nextExpectedLengthNames, nestedCurrentIndexes);
        }
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
