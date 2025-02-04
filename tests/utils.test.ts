import { describe, expect, test } from "vitest";
import {prod, shapeSlice} from "../src/utils";
import {Shape} from "@stdlib/types/ndarray";

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
        expect(() => { shapeSlice(shape, 3) }).toThrowError(
            "Cannot start shape slice at index 3 - shape has only 3 elements"
        );
    });
});