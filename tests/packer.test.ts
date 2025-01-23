import { describe, expect, test } from "vitest"
import {Packer} from "../src/packer.ts";

describe("Packer class", () => {
    describe("constructor", () => {

        const scalar = new Set<string>(["b", "c", "a"])

        const array = new Map([
            [ "X", 3 ],
            [ "Y", [ 2, 4 ] ]
        ]);
        test("builds expected fields for scalar-only packer", () => {
            const sut = new Packer({ scalar });
            expect(sut["len"]).toBe(3);
            expect(sut["nms"]).toStrictEqual(["b", "c", "a"]);
            expect(sut["idx"]).toStrictEqual({ b: 0, c: 1, a: 2});
            expect(sut["shape"]).toStrictEqual({ b: [0], c: [0], a: [0] });
        });

        test("builds expected properties for array-only packer", () => {
            // Param A is 1D array of length 3, param B is 2D array of size 2x4
            const sut = new Packer({ array });
            expect(sut["len"]).toBe(11);
            expect(sut["nms"]).toStrictEqual([
                "X[1]", "X[2]", "X[3]",
                "Y[1,1]", "Y[1,2]", "Y[1,3]", "Y[1,4]",
                "Y[2,1]", "Y[2,2]", "Y[2,3]", "Y[2,4]"
            ]);
            expect(sut["idx"]).toStrictEqual({
                X: [0, 1, 2],
                Y: [3, 4, 5, 6, 7, 8, 9, 10]
            });
            expect(sut["shape"]).toStrictEqual({
                X: [3],
                Y: [2, 4]
            });
        });

        test("builds expected properties for packer with both scalar and array", () => {
            const sut = new Packer({ scalar, array });
            // TODO!
        });

        /*test("throws error if duplicate names");

        test("throws error if non-integer dimension values"); // TODO: or use type system for this

        test("throws error if dimension values of zero or less"); */
    });

    //describe("unpack one-dimensional array")
});
