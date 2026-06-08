import { describe, expect, test } from "vitest";
import { array, DimUtils } from "../src/interfaces/generators/imports/array";

describe("array", () => {
    // 5 x 4 x 3 x 2 in the 4D case, otherwise dimensions up to the dim index
    // so in 3D it will be 5 x 4 x 6 for this test, and in 2D it will be
    // 5 x 24
    const totalSize = 5 * 4 * 3 * 2;
    const dim4d: DimUtils = {
        dim: [5, 4, 3, 2],
        size: totalSize,
        mult: [1, 5, 20, 60]
    };
    const dim3d: DimUtils = {
        dim: [5, 4, 6],
        size: totalSize,
        mult: [1, 5, 20]
    };
    const dim2d: DimUtils = {
        dim: [5, 24],
        size: totalSize,
        mult: [1, 5]
    };
    const dim1d: DimUtils = {
        dim: [120],
        size: totalSize,
        mult: [1]
    };

    test("sum functions work as expected", () => {
        const arr = Array.from({ length: totalSize }).map(() => 1);
        expect(array.sumAll(arr)).toBe(totalSize);
        expect(
            // sum over
            // i = 2, 3;
            // j = 1, 2, 3;
            // k = 0, 1;
            // l = 1;
            array.sum4(arr, dim4d, [2, 3], [1, 3], [0, 1], [1, 1])
        ).toBe(2 * 3 * 2 * 1); // lengths of i,j,k,l intervals
        expect(array.sum3(arr, dim3d, [2, 3], [1, 3], [2, 5])).toBe(2 * 3 * 4);
        expect(array.sum2(arr, dim2d, [2, 3], [11, 20])).toBe(2 * 10);
        expect(array.sum1(arr, dim1d, [2, 100])).toBe(99);
    });

    test("prod functions work as expected", () => {
        const arr = Array.from({ length: totalSize }).map(() => 0.9);
        expect(array.prodAll(arr)).toBeCloseTo(Math.pow(0.9, totalSize));
        expect(array.prod4(arr, dim4d, [2, 3], [1, 3], [0, 1], [1, 1])).toBeCloseTo(Math.pow(0.9, 2 * 3 * 2 * 1));
        expect(array.prod3(arr, dim3d, [2, 3], [1, 3], [2, 5])).toBeCloseTo(Math.pow(0.9, 2 * 3 * 4));
        expect(array.prod2(arr, dim2d, [2, 3], [11, 20])).toBeCloseTo(Math.pow(0.9, 2 * 10));
        expect(array.prod1(arr, dim1d, [2, 100])).toBeCloseTo(Math.pow(0.9, 99));
    });

    test("min functions work as expected", () => {
        const arr = Array.from({ length: totalSize }).map((_, i) => totalSize - i);
        expect(array.minAll(arr)).toBe(1);
        expect(
            // this array is decreasing so the min will effectively be located at the
            // maximum index it can get to, which is just the flat index of the maximum
            // of the coordinate ranges
            array.min4(arr, dim4d, [2, 3], [1, 3], [0, 1], [1, 1])
        ).toBe(totalSize - (3 + 3 * dim4d.mult[1] + 1 * dim4d.mult[2] + 1 * dim4d.mult[3]));
        expect(array.min3(arr, dim3d, [2, 3], [1, 3], [2, 5])).toBe(
            totalSize - (3 + 3 * dim4d.mult[1] + 5 * dim4d.mult[2])
        );
        expect(array.min2(arr, dim2d, [2, 3], [11, 20])).toBe(totalSize - (3 + 20 * dim4d.mult[1]));
        expect(array.min1(arr, dim1d, [2, 100])).toBe(totalSize - 100);
    });

    test("max functions work as expected", () => {
        // using property that max(-arr) = -min(arr)
        const arr = Array.from({ length: totalSize }).map((_, i) => i - totalSize);
        expect(array.maxAll(arr)).toBe(-1);
        expect(array.max4(arr, dim4d, [2, 3], [1, 3], [0, 1], [1, 1])).toBe(
            3 + 3 * dim4d.mult[1] + 1 * dim4d.mult[2] + 1 * dim4d.mult[3] - totalSize
        );
        expect(array.max3(arr, dim3d, [2, 3], [1, 3], [2, 5])).toBe(
            3 + 3 * dim4d.mult[1] + 5 * dim4d.mult[2] - totalSize
        );
        expect(array.max2(arr, dim2d, [2, 3], [11, 20])).toBe(3 + 20 * dim4d.mult[1] - totalSize);
        expect(array.max1(arr, dim1d, [2, 100])).toBe(100 - totalSize);
    });

    test("assign array slice function works", () => {
        const bigArr = [1, 2, 3, 4, 5];
        const smallArr = [10, 20, 30];
        array.assignArrayToSliceOfArray(bigArr, 1, smallArr);
        expect(bigArr).toStrictEqual([1, 10, 20, 30, 5]);
    });

    test("dim object proxy works as expected", () => {
        const dimObj = array.getDimObj();
        // @ts-expect-error typescript doesn't seem to respect
        // proxies
        dimObj.x = [5, 4, 3, 2];
        expect(dimObj.x).toStrictEqual(dim4d);
    });
});
