import { describe, test, expect } from "vitest";
import { SystemDataComparison } from "../src/SystemDataComparison.ts";

describe("SystemDataComparison", () => {
    test("can construct, set and get values", () => {
        const sut = new SystemDataComparison(2, 3);
        sut.setValue(0, 0, 1);
        sut.setValue(0, 1, 2);
        sut.setValue(0, 2, 3);

        sut.setValue(1, 0, 4);
        sut.setValue(1, 1, 5);
        sut.setValue(1, 2, 6);

        expect(sut.getValue(0, 0)).toBe(1);
        expect(sut.getValue(0, 1)).toBe(2);
        expect(sut.getValue(0, 2)).toBe(3);
        expect(sut.getValue(1, 0)).toBe(4);
        expect(sut.getValue(1, 1)).toBe(5);
        expect(sut.getValue(1, 2)).toBe(6);
    });

    test("throws expected range errors from constructor", () => {
        expect(() => new SystemDataComparison(1.5, 2)).toThrowError(
            "nGroups should be an integer greater than or equal to 1, but is 1.5."
        );

        expect(() => new SystemDataComparison(2, -2)).toThrowError(
            "nParticles should be an integer greater than or equal to 1, but is -2."
        );
    });

    test("throws expected range errors on get", () => {
        const sut = new SystemDataComparison(2, 3);
        expect(() => sut.getValue(3, 1)).toThrowError("iGroup should be an integer between 0 and 1, but is 3.");
        expect(() => sut.getValue(1, -1)).toThrowError("iParticle should be an integer between 0 and 2, but is -1.");
    });

    test("throws expected range errors on set", () => {
        const sut = new SystemDataComparison(2, 3);
        expect(() => sut.setValue(3.5, 1, 1)).toThrowError("iGroup should be an integer between 0 and 1, but is 3.5.");
        expect(() => sut.setValue(1, -1.5, 0)).toThrowError(
            "iParticle should be an integer between 0 and 2, but is -1.5."
        );
    });
});
