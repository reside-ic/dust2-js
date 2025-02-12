import { describe, expect, test } from "vitest";
import { checkIntegerInRange, particleStateToArray, prod, shapeSlice } from "../src/utils";
import { Shape } from "@stdlib/types/ndarray";
import ndarray from "ndarray";
import { ParticleState } from "../src/SystemState.ts";

describe("prod", () => {
    test("returns product of all elements in array", () => {
        expect(prod([2, 3, 7])).toBe(42);
    });

    test("returns 1 for empty array", () => {
        expect(prod([])).toBe(1);
    });
});

describe("shapeSlice", () => {
    const shape = [10, 20, 30] as Shape;

    test("returns slice from 1", () => {
        expect(shapeSlice(shape, 1)).toStrictEqual([20, 30]);
    });

    test("returns slice from 2", () => {
        expect(shapeSlice(shape, 2)).toStrictEqual([30]);
    });

    test("throws error if requested start exceeds length", () => {
        expect(() => {
            shapeSlice(shape, 3);
        }).toThrowError("Cannot start shape slice at index 3 - shape has only 3 elements");
    });
});

describe("particleStateToArray", () => {
    test("returns expected array", () => {
        const state = ndarray([1, 2, 3, 4], [4]) as ParticleState;
        expect(particleStateToArray(state)).toStrictEqual([1, 2, 3, 4]);
    });
});

describe("checkIntegerInRange", () => {
    test("throws expected error when value is not integer", () => {
        expect(() => checkIntegerInRange("Test", 1.2, 0, 2)).toThrow(
            "Test should be an integer between 0 and 2, but is 1.2."
        );
    });

    test("throws expected error value is less than min", () => {
        expect(() => checkIntegerInRange("Test", 2, 10, 20)).toThrow(
            "Test should be an integer between 10 and 20, but is 2."
        );
    });

    test("throws expected error when value is less than min, and there is no max", () => {
        expect(() => checkIntegerInRange("Test", 2, 10)).toThrow(
            "Test should be an integer greater than or equal to 10, but is 2."
        );
    });

    test("throws expected error when value is greater than max", () => {
        expect(() => checkIntegerInRange("Test", 22, 10, 20)).toThrow(
            "Test should be an integer between 10 and 20, but is 22."
        );
    });

    test("does not throw when value is within range", () => {
        checkIntegerInRange("Test", 12, 10, 20);
        checkIntegerInRange("Test", 10, 10, 20); // value is min
        checkIntegerInRange("Test", 20, 10, 20); // value is max
    });

    test("does not throw when value is greater than or equal to min, when there is no max", () => {
        checkIntegerInRange("Test", 12, 10);
        checkIntegerInRange("Test", 10, 10);
    });
});
