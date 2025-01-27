import { describe, expect, test } from "vitest";
import ndarray, {NdArray} from "ndarray";
import ndarray_unpack from "ndarray-unpack";
import {Packer} from "../src/packer.ts";

describe("Packer class", () => {
    const scalar = new Set<string>(["b", "c", "a"])

    const array = new Map([
        [ "X", 3 ],
        [ "Y", [ 2, 4 ] ]
    ]);

    describe("constructor", () => {

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
            expect(sut["len"]).toBe(14);
            expect(sut["nms"]).toStrictEqual([
                "b", "c", "a",
                "X[1]", "X[2]", "X[3]",
                "Y[1,1]", "Y[1,2]", "Y[1,3]", "Y[1,4]",
                "Y[2,1]", "Y[2,2]", "Y[2,3]", "Y[2,4]"
            ]);
            expect(sut["idx"]).toStrictEqual({
                b: 0,
                c: 1,
                a: 2,
                X: [3, 4, 5],
                Y: [6, 7, 8, 9, 10, 11, 12, 13]
            });
            expect(sut["shape"]).toStrictEqual({
                b: [0],
                c: [0],
                a: [0],
                X: [3],
                Y: [2, 4]
            });
        });

        test("build expected properties for packer with scalar values specified in array option", () => {
            const sut = new Packer({
                scalar: new Set<string>(["a"]),
                // null or empty array can both be used to indicate scalar within 'array'
                array: new Map([
                    [ "X", 3 ],
                    [ "b", null ],
                    [ "Y", [ 2, 4 ] ],
                    [ "c", [] ]
                ])
            });
            expect(sut["len"]).toBe(14);
            expect(sut["nms"]).toStrictEqual([
                "a",
                "X[1]", "X[2]", "X[3]",
                "b",
                "Y[1,1]", "Y[1,2]", "Y[1,3]", "Y[1,4]",
                "Y[2,1]", "Y[2,2]", "Y[2,3]", "Y[2,4]",
                "c"
            ]);
            expect(sut["idx"]).toStrictEqual({
                a: 0,
                X: [1, 2, 3],
                b: [4],
                Y: [5, 6, 7, 8, 9, 10, 11, 12],
                c: [13]
            });

            expect(sut["shape"]).toStrictEqual({
                a: [0],
                X: [3],
                b: [0],
                Y: [2, 4],
                c: [0]
            });
        });

        // TODO !
        /*test("throws error if duplicate names");

        test("throws error if non-integer dimension values"); // TODO: or use type system for this

        test("throws error if dimension values of zero or less"); */
    });

    describe("unpacks one-dimensional array", () => {
        test("as expected for scalar only values", () => {
            const sut = new Packer({ scalar });
            const result = sut.unpack_array([100, 200, 300]);
            expect(result).toStrictEqual(new Map([
                ["b", 100],
                ["c", 200],
                ["a", 300]
            ]));
        });

        const expectArrayValuesInUnpackResult = (result) => {
            expect(result.get("X")).toStrictEqual([10, 20, 30]);
            const y = result.get("Y");
            expect(y.shape).toStrictEqual([2, 4]);
            expect(y.get(0, 0)).toBe(100)
            expect(y.get(0, 1)).toBe(200);
            expect(y.get(0, 2)).toBe(300)
            expect(y.get(0, 3)).toBe(400);
            expect(y.get(1, 0)).toBe(500)
            expect(y.get(1, 1)).toBe(600);
            expect(y.get(1, 2)).toBe(700)
            expect(y.get(1, 3)).toBe(800);
        };

        test("as expected for array only values", () => {
            // We expect unpacked 1D arrays to be unpacked as plain Arrays,
            // and higher dimensions to be unpacked as ndarrays
            const sut = new Packer({ array });
            const result = sut.unpack_array([10, 20, 30, 100, 200, 300, 400, 500, 600, 700, 800]);
            expect(result.size).toBe(2);
            expectArrayValuesInUnpackResult(result);
        });

        test("as expected for both array and scalar values", () => {
            const sut = new Packer({ array, scalar });
            const result = sut.unpack_array([1, 2, 3, 10, 20, 30, 100, 200, 300, 400, 500, 600, 700, 800]);
            expect(Array.from(result.keys())).toStrictEqual(["b", "c", "a", "X", "Y"]);
            expect(result.get("b")).toBe(1);
            expect(result.get("c")).toBe(2);
            expect(result.get("a")).toBe(3);expect(result.get("X")).toStrictEqual([10, 20, 30]);
            const y = result.get("Y");
            expectArrayValuesInUnpackResult(result);

        });

        test("as expected with scalar values specified in array option", () => {
            const sut = new Packer({
                scalar: new Set<string>(["a"]),
                // null or empty array can both be used to indicate scalar within 'array'
                array: new Map([
                    [ "X", 3 ],
                    [ "b", null ],
                    [ "Y", [ 2, 2 ] ],
                    [ "c", [] ]
                ])
            });
            expect(sut["len"]).toBe(10);
            expect(sut["nms"]).toStrictEqual([
                "a",
                "X[1]", "X[2]", "X[3]",
                "b",
                "Y[1,1]", "Y[1,2]",
                "Y[2,1]", "Y[2,2]",
                "c"
            ]);
            expect(sut["idx"]).toStrictEqual({
                a: 0,
                X: [1, 2, 3],
                b: [4],
                Y: [5, 6, 7, 8],
                c: [9]
            });
            const result = sut.unpack_array([
                1, //a
                10, 20, 30, // X
                2, // b
                1000, 2000, 3000, 4000, //Y
                3, // c
            ]);
            expect(Array.from(result.keys())).toStrictEqual(["a", "X", "b", "Y", "c"]);
            expect(result.get("a")).toBe(1);
            expect(result.get("X")).toStrictEqual([10, 20, 30]);
            expect(result.get("b")).toBe(2);
            const y = result.get("Y");
            expect(y.shape).toStrictEqual([2, 2]);
            expect(y.get(0, 0)).toBe(1000);
            expect(y.get(0, 1)).toBe(2000);
            expect(y.get(1, 0)).toBe(3000);
            expect(y.get(1, 1)).toBe(4000);
        });

        // TODO !
        /*test("as expected with fixed data");
        test("as expected with process option");
        test("throws error if input has wrong length");
        */
    });

    describe("unpacks multi-dimensional array", () => {
        test("as expected for both array and scalar values", () => {
            const sut = new Packer({
                scalar: new Set<string>(["a", "b"]),
                array: new Map([
                    [ "Y", [ 2, 2 ] ]
                ])
            });


            /*const x = ndarray_pack([
                [1, 2], // a
                [30, 40], // b
                [500, 600], // c11
                [700, 800], // c12
                [900, 1000], // c21
                [1100, 1200] // c22
            ]);*/

            const x = ndarray(new Int32Array(12), [6, 2]);
            // a
            x.set(0, 0, 1);
            x.set(0, 1, 2);

            // b
            x.set(1, 0, 30);
            x.set(1, 1, 40);

            // Y11
            x.set(2, 0, 500);
            x.set(2, 1, 600);

            // Y12
            x.set(3, 0, 700);
            x.set(3, 1, 800);

            // Y21
            x.set(4, 0, 900);
            x.set(4, 1, 1000);

            // Y22
            x.set(5, 0, 1100);
            x.set(5, 1, 1200);

            const result = sut.unpack_ndarray(x);

            // Expect all results from unpack_ndarray to be ndarrays
            const a = result.get("a");
            expect(a.shape).toStrictEqual([2]);
            expect(a.get(0)).toBe(1);
            expect(a.get(1)).toBe(2);

            const b = result.get("b");
            expect(b.shape).toStrictEqual([2]);
            expect(b.get(0)).toBe(30);
            expect(b.get(1)).toBe(40);

            const y = result.get("Y");
            expect(y.shape).toStrictEqual([2, 2, 2]);
            // Y11
            expect(y.get(0, 0, 0)).toBe(500);
            expect(y.get(0, 0, 1)).toBe(600);
        });
    });
});
