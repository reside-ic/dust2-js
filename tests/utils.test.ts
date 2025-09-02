import { describe, expect, test } from "vitest";
import {
    checkIndicesForMax,
    checkIntegerInRange,
    checkNestedArrayLengthsMatch,
    ndArrayFrom,
    arrayStateToArray,
    prod,
    checkTimes
} from "../src/utils";
import ndarray from "ndarray";
import { ArrayState, SystemSubState } from "../src/SystemState.ts";

describe("prod", () => {
    test("returns product of all elements in array", () => {
        expect(prod([2, 3, 7])).toBe(42);
    });

    test("returns 1 for empty array", () => {
        expect(prod([])).toBe(1);
    });
});

describe("arrayStateToArray", () => {
    test("returns expected array", () => {
        const state = ndarray([1, 2, 3, 4], [4]) as ArrayState;
        expect(arrayStateToArray(state)).toStrictEqual([1, 2, 3, 4]);
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

describe("ndArrayFrom", () => {
    test("can convert number[][] to ndArray", () => {
        const result = ndArrayFrom([
            [1, 2],
            [3, 4],
            [5, 6]
        ]);
        expect(result.shape).toStrictEqual([3, 2]);
        expect(result.get(0, 0)).toBe(1);
        expect(result.get(0, 1)).toBe(2);
        expect(result.get(1, 0)).toBe(3);
        expect(result.get(1, 1)).toBe(4);
        expect(result.get(2, 0)).toBe(5);
        expect(result.get(2, 1)).toBe(6);
    });

    test("throws error if source length is 0", () => {
        expect(() => ndArrayFrom([])).toThrow("Cannot convert from empty source");
    });

    test("throws error if source arrays are different lengths", () => {
        expect(() =>
            ndArrayFrom([
                [1, 2],
                [3, 4, 5]
            ])
        ).toThrow("Source arrays must all be the same length");
    });

    test("can convert array of empty arrays", () => {
        const result = ndArrayFrom([[], []]);
        expect(result.shape).toStrictEqual([2, 0]);
    });
});

describe("checkIndicesForMax", () => {
    test("does not throw error for valid indices", () => {
        checkIndicesForMax("TEST", [0, 2, 5], 5);
    });

    test("throws expected error if indices are not ordered", () => {
        expect(() => {
            checkIndicesForMax("TEST", [0, 3, 1], 3);
        }).toThrow("TEST indices must be ordered with no duplicates");
    });

    test("throws expected error if indices contain duplicates", () => {
        expect(() => {
            checkIndicesForMax("TEST", [0, 0, 1], 3);
        }).toThrow("TEST indices must be ordered with no duplicates");
    });

    test("throws expected error if any indices are greater than max", () => {
        expect(() => {
            checkIndicesForMax("TEST", [0, 1, 2, 5], 4);
        }).toThrow("TEST should be an integer between 0 and 4, but is 5");
    });

    test("throws expected error if any indices are less than 0", () => {
        expect(() => {
            checkIndicesForMax("TEST", [-1, 1, 2, 3], 4);
        }).toThrow("TEST should be an integer between 0 and 4, but is -1");
    });

    test("throws expected error if any indices are not integers", () => {
        expect(() => {
            checkIndicesForMax("TEST", [0, 1, 2.5, 3], 4);
        }).toThrow("TEST should be an integer between 0 and 4, but is 2.5");
    });
});

describe("checkNestedArrayLengthsMatch", () => {
    const testArray: SystemSubState = [
        // Group 1
        [
            // Particle 1
            [0, 1, 2, 3],

            // Particle 2
            [4, 5, 6, 7],

            // Particle 3
            [8, 9, 10, 11]
        ],
        // Group 2
        [
            // Particle 1
            [100, 101, 102, 103],

            // Particle 2
            [104, 105, 106, 107],

            // Particle 3
            [108, 109, 110, 111]
        ]
    ];

    const expectedNames = ["Groups", "Particles", "State Elements"];

    test("does not throw error if nested array has expected lengths", () => {
        checkNestedArrayLengthsMatch(testArray, [2, 3, 4], expectedNames);
    });

    test("throws expected error if expectedLengths and expectedLengthNames do not match", () => {
        expect(() => {
            checkNestedArrayLengthsMatch(testArray, [2, 3], expectedNames);
        }).toThrow(
            "Unexpected parameters in checkNestedArrayLengthsMatch: " +
                "expectedLengths and expectedLengthNames should be same length"
        );
    });

    test("throws expected error if top level length is not expected", () => {
        expect(() => {
            checkNestedArrayLengthsMatch(testArray, [3, 3, 4], expectedNames);
        }).toThrow("Groups should have length 3 but was 2");
    });

    test("throws expected error if nested length is not expected", () => {
        expect(() => {
            checkNestedArrayLengthsMatch(testArray, [2, 2, 4], expectedNames);
        }).toThrow("Particles should have length 2 but was 3 at index 0");

        expect(() => {
            checkNestedArrayLengthsMatch(testArray, [2, 3, 5], expectedNames);
        }).toThrow("State Elements should have length 5 but was 4 at index 0,0");
    });

    test("throws expected error if nested array length is not expected in jagged array", () => {
        const jaggedGroups: SystemSubState = [
            [
                [0, 1, 2, 3],
                [4, 5, 6, 7],
                [8, 9, 10, 11]
            ],
            [
                [100, 101, 102, 103],
                [108, 109, 110, 111]
            ]
        ];
        expect(() => {
            checkNestedArrayLengthsMatch(jaggedGroups, [2, 3, 4], expectedNames);
        }).toThrow("Particles should have length 3 but was 2 at index 1");

        const jaggedParticles: SystemSubState = [
            [
                [0, 1, 2, 3],
                [4, 5, 6, 7],
                [8, 9, 10, 11]
            ],
            [
                [100, 101, 102, 103],
                [104, 105, 106, 107],
                [108, 109]
            ]
        ];
        expect(() => {
            checkNestedArrayLengthsMatch(jaggedParticles, [2, 3, 4], expectedNames);
        }).toThrow("State Elements should have length 4 but was 2 at index 1,2");
    });

    describe("checkTimes", () => {
        test("does not throw error if times are in order, >= min with no duplicates", () => {
            checkTimes([1, 1.5, 3, 10], 1);
        });
        test("throws error if any time is less than min", () => {
            expect(() => checkTimes([0, 1, 2, 3], 1)).toThrow("Times must be greater than or equal to 1, but found 0.");
        });

        test("throws error if times are not in order", () => {
            expect(() => checkTimes([0, 1, 0.5, 3], 0)).toThrow("Times must be ordered with no duplicates.");
        });

        test("throws error if there are duplicates", () => {
            expect(() => checkTimes([1, 2, 2, 3], 1)).toThrow("Times must be ordered with no duplicates.");
        });
    });
});
