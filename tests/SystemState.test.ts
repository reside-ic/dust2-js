import { describe, test, expect } from "vitest";
import { SystemState } from "../src/SystemState.ts";
import { particleStateToArray } from "../src/utils.ts";

describe("SystemState", () => {
    const createSystemState = () => new SystemState(2, 3, 4);

    test("can set and get particles", () => {
        const sut = createSystemState();
        sut.setParticle(0, 1, [10, 20, 30, 40]);
        sut.setParticle(1, 2, [50, 60, 70, 80]);

        expect(particleStateToArray(sut.getParticle(0, 1))).toStrictEqual([10, 20, 30, 40]);
        expect(particleStateToArray(sut.getParticle(1, 2))).toStrictEqual([50, 60, 70, 80]);
    });

    test("throws error when attempt get with invalid index", () => {
        const sut = createSystemState();
        expect(() => sut.getParticle(2, 2)).toThrowError("Group index should be an integer between 0 and 1, but is 2.");
        expect(() => sut.getParticle(1, 3)).toThrowError(
            "Particle index should be an integer between 0 and 2, but is 3."
        );
        expect(() => sut.getParticle(0.5, 2)).toThrowError(
            "Group index should be an integer between 0 and 1, but is 0.5."
        );
        expect(() => sut.getParticle(1, 1.1)).toThrowError(
            "Particle index should be an integer between 0 and 2, but is 1.1."
        );
    });

    test("throws error when attempt set with invalid index", () => {
        const sut = createSystemState();
        const vals = [1, 2, 3, 4];
        expect(() => sut.setParticle(2, 2, vals)).toThrowError(
            "Group index should be an integer between 0 and 1, but is 2."
        );
        expect(() => sut.setParticle(1, 3, vals)).toThrowError(
            "Particle index should be an integer between 0 and 2, but is 3."
        );
        expect(() => sut.setParticle(0.5, 2, vals)).toThrowError(
            "Group index should be an integer between 0 and 1, but is 0.5."
        );
        expect(() => sut.setParticle(1, 1.1, vals)).toThrowError(
            "Particle index should be an integer between 0 and 2, but is 1.1."
        );
    });

    test("throws error when attempt set with array of incorrect length", () => {
        const sut = createSystemState();
        expect(() => sut.setParticle(0, 0, [0, 1])).toThrowError("Particle state array must be of length 4.");
    });
});
