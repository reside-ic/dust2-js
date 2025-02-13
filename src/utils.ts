import { ParticleState } from "./SystemState.ts";

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
