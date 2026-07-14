import { describe, test, expect, vi, Mocked, MockInstance } from "vitest";
import { poissonLogDensity } from "../src/density.ts";
import { discreteSIR, SIRData, SIRParams } from "./examples/discreteSIR.ts";
import { Random } from "@reside-ic/random";
import { expectedInitial, sirParams } from "./examples/SIRTestHelpers.ts";
import ndarray from "ndarray";
import { System } from "../src/System.ts";
import { ABState, zeroTwice } from "./examples/zeroTwice.ts";
import { imports } from "../src/interfaces/generators/Imports.ts";

const generator = discreteSIR;

const createSystem = (random?: Random) =>
    System.createDiscrete<SIRParams, null, SIRData>(
        generator,
        sirParams,
        5, // time
        0.5, // dt
        3, // nParticles
        undefined,
        random
    );

describe("ComparableDiscreteSystem", () => {
    test("can compare data", () => {
        const genCompareDataSpy = vi.spyOn(generator, "compareData") as MockInstance;
        const sys = createSystem();
        sys.setStateInitial(); // compare data with initial state
        const data = { prevalence: 2 };
        const result = sys.compareData(data);
        expect(result.shape).toStrictEqual([3]);
        const expectedValue = poissonLogDensity(2, 1);
        expect(result.get(0)).toBe(expectedValue);
        expect(result.get(1)).toBe(expectedValue);
        expect(result.get(2)).toBe(expectedValue);

        expect(genCompareDataSpy).toHaveBeenCalledTimes(3);
        const expectedParams = [imports, 5, expectedInitial, data, sirParams, null, sys["_random"]];
        expect(genCompareDataSpy.mock.calls[0]).toStrictEqual(expectedParams);
        expect(genCompareDataSpy.mock.calls[1]).toStrictEqual(expectedParams);
        expect(genCompareDataSpy.mock.calls[2]).toStrictEqual(expectedParams);
    });

    const expectSharedDataResult = (
        result: ndarray.NdArray,
        data: SIRData,
        genCompareDataSpy: Mocked<any>,
        random: Random
    ) => {
        const expectedValue = poissonLogDensity(2, 1);
        expect(result.get(0)).toBe(expectedValue);
        expect(result.get(1)).toBe(expectedValue);
        expect(result.get(2)).toBe(expectedValue);

        expect(genCompareDataSpy).toHaveBeenCalledTimes(3);
        const expectedParams = [imports, 5, expectedInitial, data, sirParams, null, random];
        expect(genCompareDataSpy.mock.calls[0]).toStrictEqual(expectedParams);
        expect(genCompareDataSpy.mock.calls[1]).toStrictEqual(expectedParams);
        expect(genCompareDataSpy.mock.calls[2]).toStrictEqual(expectedParams);
    };

    test("can compare with shared data - object", () => {
        const genCompareDataSpy = vi.spyOn(generator, "compareData");
        const sys = createSystem();
        sys.setStateInitial();
        const data = { prevalence: 2 };
        const result = sys.compareData(data);
        expectSharedDataResult(result, data, genCompareDataSpy, sys["_random"]);
    });

    test("compareData throws error generator doesn't specify a compareData Function", () => {
        const sys = System.createDiscrete<ABState, null>(
            zeroTwice,
            { a: 5, b: 10 },
            5, // time
            0.5, // dt
            3, // nParticles
            undefined
        );
        sys.setStateInitial();
        expect(() => sys.compareData(null)).toThrowError("Generator does not specify a compareData function");
    });
});
