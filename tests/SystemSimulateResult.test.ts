import { describe, test, expect } from "vitest";
import { SystemSimulateResult } from "../src/SystemSimulateResult";
import { arrayStateToArray } from "../src/utils";

describe("SystemSimulateResult", () => {
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

    test("constructor validates size parameters", () => {
        expect(() => new SystemSimulateResult(0, 1, 2, 3))
            .toThrowError("Number of groups should be an integer greater than or equal to 1, but is 0.");
        expect(() => new SystemSimulateResult(1, -1, 2, 3))
            .toThrowError("Number of particles should be an integer greater than or equal to 1, but is -1.");
        expect(() => new SystemSimulateResult(1, 1, 0, 3))
            .toThrowError("Number of state elements should be an integer greater than or equal to 1, but is 0.");
        expect(() => new SystemSimulateResult(1, 1, 1))
            .toThrowError("Number of times should be an integer greater than or equal to 1, but is undefined.");
    });

    test("setValuesForTime checks indexes", () => {
        const sut = new SystemSimulateResult(2, 3, 4, 5);

        // Can set max index value for all dimensions
        sut.setValuesForTime(1, 2, 4, [10, 20, 30, 40]);
        expect(arrayStateToArray(sut.getValuesForTime(1, 2, 4))).toStrictEqual([10, 20, 30, 40]);

        expect(() => sut.setValuesForTime(2, 2, 4, [10, 20, 30, 40]))
            .toThrowError("Group index should be an integer between 0 and 1, but is 2.");
        expect(() => sut.setValuesForTime(-1, 2, 4, [10, 20, 30, 40]))
            .toThrowError("Group index should be an integer between 0 and 1, but is -1.");

        expect(() => sut.setValuesForTime(0, 3, 4, [10, 20, 30, 40]))
            .toThrowError("Particle index should be an integer between 0 and 2, but is 3.");
        expect(() => sut.setValuesForTime(0, -1.3, 4, [10, 20, 30, 40]))
            .toThrowError("Particle index should be an integer between 0 and 2, but is -1.3.");

        expect(() => sut.setValuesForTime(0, 1, 5, [10, 20, 30, 40]))
            .toThrowError("Time index should be an integer between 0 and 4, but is 5.");
        expect(() => sut.setValuesForTime(0, 1, 3.9, [10, 20, 30, 40]))
            .toThrowError("Time index should be an integer between 0 and 4, but is 3.9.");
    });

    test("setValuesForTime checks values size", () => {
        const sut = new SystemSimulateResult(2, 3, 4, 5);
        expect(() => sut.setValuesForTime(1, 2, 4, [10, 20, 30]))
            .toThrowError("Expected 4 state values but got 3.");
        expect(() => sut.setValuesForTime(1, 2, 4, [10, 20, 30, 40, 50]))
            .toThrowError("Expected 4 state values but got 5.");
    });

    test("getValuesForTime checks indexes", () => {
        const sut = new SystemSimulateResult(2, 3, 4, 5);
        expect(() => sut.getValuesForTime(2, 2, 2))
            .toThrow("Group index should be an integer between 0 and 1, but is 2.");
        expect(() => sut.getValuesForTime(1, 3, 4))
            .toThrow("Particle index should be an integer between 0 and 2, but is 3.");
        expect(() => sut.getValuesForTime(1, 1, 40))
            .toThrow("Time index should be an integer between 0 and 4, but is 40.");
    });

    test("getStateElement checks indexes", () => {
        const sut = new SystemSimulateResult(2, 3, 4, 5);
        expect(() => sut.getStateElement(2, 2, 2))
            .toThrow("Group index should be an integer between 0 and 1, but is 2.");
        expect(() => sut.getStateElement(1, 3, 4))
            .toThrow("Particle index should be an integer between 0 and 2, but is 3.");
        expect(() => sut.getStateElement(1, 1, 40))
            .toThrow("State Element index should be an integer between 0 and 3, but is 40.");
    });

    test("can get resultValues ndArray", () => {
        const sut = new SystemSimulateResult(2, 3, 4, 5);
        expect(sut.resultValues().size).toBe(2*3*4*5);
    });
});