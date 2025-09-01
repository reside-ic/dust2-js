import { describe, test, expect } from "vitest";
import { SystemSimulateResult } from "../src/SystemSimulateResult";
import { arrayStateToArray } from "../src/utils";

describe("SystenSimulateResult", () => {
    test("can get values for time", () => {
        const sut = new SystemSimulateResult(2, 3, 4, 2);

        sut.setValuesForTime(0, 0, 0, [1, 2, 3, 4]);
        sut.setValuesForTime(1, 2, 1, [9, 8, 7, 6]);
        
        const t0Vals = sut.getValuesForTime(0, 0, 0);
        expect(arrayStateToArray(t0Vals)).toStrictEqual([1, 2, 3, 4]);

        const t1Vals = sut.getValuesForTime(1, 2, 1);
        expect(arrayStateToArray(t1Vals)).toStrictEqual([9, 8, 7, 6]);
    });

    test("can get state element values", () => {
        const sut = new SystemSimulateResult(2, 2, 4, 2);
        sut.setValuesForTime(0, 0, 0, [100, 200, 300, 400]);
        sut.setValuesForTime(0, 1, 0, [101, 201, 301, 401]);
        sut.setValuesForTime(0, 0, 1, [900, 800, 700, 600]);
        sut.setValuesForTime(0, 1, 1, [901, 801, 701, 601]);

        expect(arrayStateToArray(sut.getStateElement(0, 0, 0))).toStrictEqual([100, 900]);
        expect(arrayStateToArray(sut.getStateElement(0, 0, 1))).toStrictEqual([200, 800]);
        expect(arrayStateToArray(sut.getStateElement(0, 0, 2))).toStrictEqual([300, 700]);
        expect(arrayStateToArray(sut.getStateElement(0, 0, 3))).toStrictEqual([400, 600]);

        expect(arrayStateToArray(sut.getStateElement(0, 1, 0))).toStrictEqual([101, 901]);
        expect(arrayStateToArray(sut.getStateElement(0, 1, 1))).toStrictEqual([201, 801]);
        expect(arrayStateToArray(sut.getStateElement(0, 1, 2))).toStrictEqual([301, 701]);
        expect(arrayStateToArray(sut.getStateElement(0, 1, 3))).toStrictEqual([401, 601]);
    });
});