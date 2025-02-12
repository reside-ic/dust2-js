import { Shape } from "@stdlib/types/ndarray";
import { ParticleState } from "./SystemState.ts";

// Product of all values in a number array
export const prod = (array: number[]) => array.reduce((prev, current) => prev * current, 1);

// stdlib's Shape type, used by ndarray, does not support the slice method because its basic type is Collection. We
// need to slice the shape to get all but the first n elements, so this provides a simple implementation.
export const shapeSlice = (shape: Shape, start: number) => {
    const len = shape.length;
    if (start >= len) {
        throw Error(`Cannot start shape slice at index ${start} - shape has only ${len} elements`);
    }
    const result = [];
    for (let i = start; i <= len - 1; i++) {
        result.push(shape[i]);
    }
    return result;
};

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
