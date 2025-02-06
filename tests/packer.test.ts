import { describe, expect, test } from "vitest";
import array from "@stdlib/ndarray/array";
import ndarray2array from "@stdlib/ndarray/to-array";
import { ndarray } from "@stdlib/types/ndarray";
import { Packer, UnpackResult } from "../src/Packer";

describe("Packer class", () => {
    const scalarShape = new Map([
        ["b", []],
        ["c", []],
        ["a", []]
    ]);
    const arrayShape = new Map([
        ["X", [3]],
        ["Y", [2, 4]]
    ]);
    const mixedShape = new Map([
        ["a", []],
        ["X", [3]],
        ["b", []],
        ["Y", [2, 4]],
        ["c", []]
    ]);

    describe("constructor", () => {
        test("builds expected fields for scalar-only packer", () => {
            const sut = new Packer({ shape: scalarShape });
            expect(sut.length).toBe(3);
            expect(sut["_idx"]).toStrictEqual({
                b: { start: 0, length: 1 },
                c: { start: 1, length: 1 },
                a: { start: 2, length: 1 }
            });
            expect(sut["_shape"]).toBe(scalarShape);
        });

        test("builds expected properties for array-only packer", () => {
            const sut = new Packer({ shape: arrayShape });
            expect(sut.length).toBe(11);
            expect(sut["_idx"]).toStrictEqual({
                X: { start: 0, length: 3 },
                Y: { start: 3, length: 8 }
            });
            expect(sut["_shape"]).toBe(arrayShape);
        });

        test("build expected properties for packer with both scalar and array values", () => {
            const sut = new Packer({ shape: mixedShape });
            expect(sut.length).toBe(14);
            expect(sut["_idx"]).toStrictEqual({
                a: { start: 0, length: 1 },
                X: { start: 1, length: 3 },
                b: { start: 4, length: 1 },
                Y: { start: 5, length: 8 },
                c: { start: 13, length: 1 }
            });
            expect(sut["_shape"]).toBe(mixedShape);
        });

        test("throws error if empty shape", () => {
            expect(() => {
                new Packer({ shape: new Map([]) });
            }).toThrowError(/Trying to generate an empty packer/);
        });

        test("throws error if non-integer dimension values", () => {
            expect(() => {
                new Packer({
                    shape: new Map([
                        ["fine", [2, 2]],
                        ["not_fine", [3, 2.5]]
                    ])
                });
            }).toThrowError(
                "All dimension values must be integers, but this is not the case for not_fine, " +
                    "whose value is [3,2.5]."
            );
        });

        test("throws error if dimension values of zero or less", () => {
            expect(() => {
                new Packer({
                    shape: new Map([
                        ["fine", [2, 2]],
                        ["not_fine", [0, 2]]
                    ])
                });
            }).toThrowError(
                "All dimension values must be at least 1, but this is not the case for not_fine, " +
                    "whose value is [0,2]."
            );

            expect(() => {
                new Packer({
                    shape: new Map([
                        ["fine", [2, 2]],
                        ["not_fine", [2, -1]]
                    ])
                });
            }).toThrowError(
                "All dimension values must be at least 1, but this is not the case for not_fine, " +
                    "whose value is [2,-1]."
            );
        });
    });

    const expectUnpackedArrayValues = (result: UnpackResult) => {
        const x = result.get("X") as ndarray;
        expect(x.shape).toStrictEqual([3]);
        expect(x.get(0)).toBe(10);
        expect(x.get(1)).toBe(20);
        expect(x.get(2)).toBe(30);
        const y = result.get("Y") as ndarray;
        expect(y.shape).toStrictEqual([2, 4]);
        expect(y.get(0, 0)).toBe(100);
        expect(y.get(0, 1)).toBe(200);
        expect(y.get(0, 2)).toBe(300);
        expect(y.get(0, 3)).toBe(400);
        expect(y.get(1, 0)).toBe(500);
        expect(y.get(1, 1)).toBe(600);
        expect(y.get(1, 2)).toBe(700);
        expect(y.get(1, 3)).toBe(800);
    };

    describe("unpacks one-dimensional array", () => {
        test("as expected for scalar only values", () => {
            const sut = new Packer({ shape: scalarShape });
            const result = sut.unpackArray([100, 200, 300]);
            expect(result).toStrictEqual(
                new Map([
                    ["b", 100],
                    ["c", 200],
                    ["a", 300]
                ])
            );
        });

        test("as expected for array only values", () => {
            const sut = new Packer({ shape: arrayShape });
            const result = sut.unpackArray([10, 20, 30, 100, 200, 300, 400, 500, 600, 700, 800]);
            expect(result.size).toBe(2);
            expectUnpackedArrayValues(result);
        });

        test("as expected with both scalar and array values", () => {
            const sut = new Packer({ shape: mixedShape });
            const result = sut.unpackArray([
                1, //a
                10,
                20,
                30, // X
                2, // b
                100,
                200,
                300,
                400,
                500,
                600,
                700,
                800, //Y
                3 // c
            ]);
            expect(Array.from(result.keys())).toStrictEqual(["a", "X", "b", "Y", "c"]);
            expect(result.get("a")).toBe(1);
            expect(result.get("b")).toBe(2);
            expect(result.get("c")).toBe(3);
            expectUnpackedArrayValues(result);
        });

        test("throws error if input has wrong length", () => {
            const sut = new Packer({ shape: mixedShape });
            expect(() => {
                sut.unpackArray([0, 1, 2, 3]);
            }).toThrowError("Incorrect length input; expected 14 but given 4.");
        });
    });

    describe("unpacks multi-dimensional array", () => {
        test("as expected for 2D array, for both array and scalar values", () => {
            const sut = new Packer({
                shape: new Map([
                    ["a", []],
                    ["b", []],
                    ["Y", [2, 2]]
                ])
            });

            const x = array(
                new Int32Array([
                    1,
                    2, // a
                    30,
                    40, // b
                    500,
                    600, // Y11
                    700,
                    800, // Y12
                    900,
                    1000, // Y21
                    1100,
                    1200 // Y22
                ]),
                { shape: [6, 2] }
            );

            const result = sut.unpackNdarray(x);

            // Expect all results from unpack_ndarray to be ndarrays
            const a = result.get("a") as ndarray;
            expect(ndarray2array(a)).toStrictEqual([1, 2]);

            const b = result.get("b") as ndarray;
            expect(b.shape).toStrictEqual([2]);
            expect(b.get(0)).toBe(30);
            expect(b.get(1)).toBe(40);
            expect(ndarray2array(b)).toStrictEqual([30, 40]);

            const y = result.get("Y") as ndarray;
            expect(y.shape).toStrictEqual([2, 2, 2]);
            expect(ndarray2array(y)).toStrictEqual([
                [
                    [500, 600],
                    [700, 800]
                ],
                [
                    [900, 1000],
                    [1100, 1200]
                ]
            ]);
        });

        test("as expected for 3D array, for both array and scalar values", () => {
            const sut = new Packer({
                shape: new Map([
                    ["a", []],
                    ["Y", [2, 2]]
                ])
            });

            const x = array(
                new Int32Array([
                    // a
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,

                    500,
                    600, // Y11
                    501,
                    601,
                    502,
                    602,

                    700,
                    800, // Y12
                    701,
                    801,
                    702,
                    802,

                    900,
                    1000, // Y21
                    901,
                    1001,
                    902,
                    1002,

                    1100,
                    1200, // Y22
                    1101,
                    1201,
                    1102,
                    1202
                ]),
                { shape: [5, 3, 2] }
            );

            const result = sut.unpackNdarray(x);

            const a = result.get("a") as ndarray;
            expect(ndarray2array(a)).toStrictEqual([
                [1, 2],
                [3, 4],
                [5, 6]
            ]);

            const y = result.get("Y") as ndarray;
            expect(y.shape).toStrictEqual([2, 2, 3, 2]);
            expect(ndarray2array(y)).toStrictEqual([
                [
                    [
                        [500, 600],
                        [501, 601],
                        [502, 602]
                    ],
                    [
                        [700, 800],
                        [701, 801],
                        [702, 802]
                    ]
                ],
                [
                    [
                        [900, 1000],
                        [901, 1001],
                        [902, 1002]
                    ],
                    [
                        [1100, 1200],
                        [1101, 1201],
                        [1102, 1202]
                    ]
                ]
            ]);
        });

        test("unpacking one-dimensional ndarray is equivalent to unpacking number Array", () => {
            const sut = new Packer({ shape: mixedShape });
            const x = array(
                new Int32Array([
                    1, //a
                    10,
                    20,
                    30, // X
                    2, // b
                    100,
                    200,
                    300,
                    400,
                    500,
                    600,
                    700,
                    800, //Y
                    3 // c
                ]),
                { shape: [14] }
            );
            const result = sut.unpackNdarray(x);
            expect(Array.from(result.keys())).toStrictEqual(["a", "X", "b", "Y", "c"]);
            expect(result.get("a")).toBe(1);
            expect(result.get("b")).toBe(2);
            expect(result.get("c")).toBe(3);
            expectUnpackedArrayValues(result);
        });

        test("throws error if input has wrong length", () => {
            const sut = new Packer({
                shape: new Map([
                    ["a", []],
                    ["b", []],
                    ["Y", [2, 2]]
                ])
            });

            const x = array(
                new Int32Array([
                    1,
                    2, // a
                    30,
                    40, // b
                    500,
                    600, // Y11
                    700,
                    800, // Y12
                    900,
                    1000 // Y21
                ]),
                { shape: [5, 2] }
            );

            expect(() => {
                sut.unpackNdarray(x);
            }).toThrowError("Incorrect length input; expected 6 but given 5.");
        });

        test("dimension of magnitude 1 is handled as expected", () => {
            const sut = new Packer({
                shape: new Map([
                    ["a", []],
                    ["b", []],
                    ["Y", [2, 2]]
                ])
            });

            const x = array(
                new Int32Array([
                    1,
                    2, // a
                    30,
                    40, // b
                    500,
                    600, // Y11
                    700,
                    800, // Y12
                    900,
                    1000, // Y21
                    1100,
                    1200 // Y22
                ]),
                { shape: [6, 2, 1] }
            );

            const result = sut.unpackNdarray(x);

            // Expect all results from unpack_ndarray to be ndarrays
            const a = result.get("a") as ndarray;
            expect(a.shape).toStrictEqual([2, 1]);
            expect(ndarray2array(a)).toStrictEqual([[1], [2]]);

            const b = result.get("b") as ndarray;
            expect(b.shape).toStrictEqual([2, 1]);
            expect(ndarray2array(b)).toStrictEqual([[30], [40]]);

            const y = result.get("Y") as ndarray;
            expect(y.shape).toStrictEqual([2, 2, 2, 1]);
            expect(ndarray2array(y)).toStrictEqual([
                [
                    [[500], [600]],
                    [[700], [800]]
                ],
                [
                    [[900], [1000]],
                    [[1100], [1200]]
                ]
            ]);
        });
    });
});
