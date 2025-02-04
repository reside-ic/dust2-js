import { Shape } from "@stdlib/types/ndarray";

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
