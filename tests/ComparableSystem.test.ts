import { describe, test, expect, vi, Mocked } from "vitest";
import { poissonLogDensity } from "../src/density.ts";
import { discreteSIR, SIRData, SIRShared } from "./examples/discreteSIR.ts";
import { Random } from "@reside-ic/random";
import { expectedGroup1Initial, expectedGroup2Initial, sirShared } from "./examples/SIRTestHelpers.ts";
import ndarray from "ndarray";
import { System } from "../src/System.ts";

const generator = discreteSIR;

const createSystem = (random?: Random) =>
    new System<SIRShared, null, SIRData>(
        generator,
        sirShared,
        5, // time
        0.5, // dt
        3, // nParticles
        random
    );

describe("ComparableDiscreteSystem", () => {
    test("can compare data", () => {
        const genCompareDataSpy = vi.spyOn(generator, "compareData");
        const sys = createSystem();
        sys.setStateInitial(); // compare data with initial state where grp1 I = 1, and grp2 I = 2
        const data = [{ prevalence: 2 }, { prevalence: 3 }];
        const result = sys.compareData(data)!;
        expect(result.shape).toStrictEqual([2, 3]);
        const expectedGrp1Value = poissonLogDensity(2, 1);
        expect(result.get(0, 0)).toBe(expectedGrp1Value);
        expect(result.get(0, 1)).toBe(expectedGrp1Value);
        expect(result.get(0, 2)).toBe(expectedGrp1Value);
        const expectedGrp2Value = poissonLogDensity(3, 2);
        expect(result.get(1, 0)).toBe(expectedGrp2Value);
        expect(result.get(1, 1)).toBe(expectedGrp2Value);
        expect(result.get(1, 2)).toBe(expectedGrp2Value);

        expect(genCompareDataSpy).toHaveBeenCalledTimes(6);
        const expectedGrp1Params = [5, expectedGroup1Initial, data[0], sirShared[0], null, sys["_random"]];
        expect(genCompareDataSpy.mock.calls[0]).toStrictEqual(expectedGrp1Params);
        expect(genCompareDataSpy.mock.calls[1]).toStrictEqual(expectedGrp1Params);
        expect(genCompareDataSpy.mock.calls[2]).toStrictEqual(expectedGrp1Params);
        const expectedGrp2Params = [5, expectedGroup2Initial, data[1], sirShared[1], null, sys["_random"]];
        expect(genCompareDataSpy.mock.calls[3]).toStrictEqual(expectedGrp2Params);
        expect(genCompareDataSpy.mock.calls[4]).toStrictEqual(expectedGrp2Params);
        expect(genCompareDataSpy.mock.calls[5]).toStrictEqual(expectedGrp2Params);
    });

    const expectSharedDataResult = (
        result: ndarray.NdArray,
        data: SIRData,
        genCompareDataSpy: Mocked<any>,
        random: Random
    ) => {
        const expectedGrp1Value = poissonLogDensity(2, 1);
        expect(result.get(0, 0)).toBe(expectedGrp1Value);
        expect(result.get(0, 1)).toBe(expectedGrp1Value);
        expect(result.get(0, 2)).toBe(expectedGrp1Value);
        const expectedGrp2Value = poissonLogDensity(2, 2);
        expect(result.get(1, 0)).toBe(expectedGrp2Value);
        expect(result.get(1, 1)).toBe(expectedGrp2Value);
        expect(result.get(1, 2)).toBe(expectedGrp2Value);

        expect(genCompareDataSpy).toHaveBeenCalledTimes(6);
        const expectedGrp1Params = [5, expectedGroup1Initial, data, sirShared[0], null, random];
        expect(genCompareDataSpy.mock.calls[0]).toStrictEqual(expectedGrp1Params);
        expect(genCompareDataSpy.mock.calls[1]).toStrictEqual(expectedGrp1Params);
        expect(genCompareDataSpy.mock.calls[2]).toStrictEqual(expectedGrp1Params);
        const expectedGrp2Params = [5, expectedGroup2Initial, data, sirShared[1], null, random];
        expect(genCompareDataSpy.mock.calls[3]).toStrictEqual(expectedGrp2Params);
        expect(genCompareDataSpy.mock.calls[4]).toStrictEqual(expectedGrp2Params);
        expect(genCompareDataSpy.mock.calls[5]).toStrictEqual(expectedGrp2Params);
    };

    test("can compare with shared data - single item array", () => {
        const genCompareDataSpy = vi.spyOn(generator, "compareData");
        const sys = createSystem();
        sys.setStateInitial();
        const data = [{ prevalence: 2 }];
        const result = sys.compareData(data)!;
        expectSharedDataResult(result, data[0], genCompareDataSpy, sys["_random"]);
    });

    test("can compare with shared data - object", () => {
        const genCompareDataSpy = vi.spyOn(generator, "compareData");
        const sys = createSystem();
        sys.setStateInitial();
        const data = { prevalence: 2 };
        const result = sys.compareData(data)!;
        expectSharedDataResult(result, data, genCompareDataSpy, sys["_random"]);
    });

    test("compareData throws error if data is unexpected length", () => {
        const sys = createSystem();
        sys.setStateInitial();
        const data = [{ prevalence: 1 }, { prevalence: 2 }, { prevalence: 3 }];
        expect(() => sys.compareData(data)!).toThrowError("Expected data to have same length as groups.");
    });
});
