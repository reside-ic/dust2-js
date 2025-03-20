import { describe, test, expect } from "vitest";
import { SystemState } from "../src/SystemState.ts";
import { ndArrayFrom, particleStateToArray } from "../src/utils.ts";
import ndarray from "ndarray";

describe("SystemState", () => {
    const createSystemState = () => new SystemState(2, 3, 4);

    test("can get nGroups", () => {
        expect(createSystemState().nGroups).toBe(2);
    });

    test("can get nParticles", () => {
        expect(createSystemState().nParticles).toBe(3);
    });

    test("can get nStateElements", () => {
        expect(createSystemState().nStateElements).toBe(4);
    });

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

    const createSystemStateForReorder = () => {
        const sut = new SystemState(2, 3, 2);

        // Initial State
        // Group 0
        sut.setParticle(0, 0, [1, 2]);
        sut.setParticle(0, 1, [3, 4]);
        sut.setParticle(0, 2, [5, 6]);
        // Group 1
        sut.setParticle(1, 0, [10, 20]);
        sut.setParticle(1, 1, [30, 40]);
        sut.setParticle(1, 2, [50, 60]);
        return sut;
    };

    test("can reorder particles", () => {
        const sut = createSystemStateForReorder();
        let reordering = ndArrayFrom([
            [1, 2, 0],
            [2, 0, 1]
        ]);
        sut.reorder(reordering);

        expect(particleStateToArray(sut.getParticle(0, 0))).toStrictEqual([3, 4]);
        expect(particleStateToArray(sut.getParticle(0, 1))).toStrictEqual([5, 6]);
        expect(particleStateToArray(sut.getParticle(0, 2))).toStrictEqual([1, 2]);

        expect(particleStateToArray(sut.getParticle(1, 0))).toStrictEqual([50, 60]);
        expect(particleStateToArray(sut.getParticle(1, 1))).toStrictEqual([10, 20]);
        expect(particleStateToArray(sut.getParticle(1, 2))).toStrictEqual([30, 40]);

        // Test that successive reordering work as expected
        reordering = ndArrayFrom([
            [2, 1, 0],
            [1, 0, 2]
        ]);
        sut.reorder(reordering);
        expect(particleStateToArray(sut.getParticle(0, 0))).toStrictEqual([1, 2]);
        expect(particleStateToArray(sut.getParticle(0, 1))).toStrictEqual([5, 6]);
        expect(particleStateToArray(sut.getParticle(0, 2))).toStrictEqual([3, 4]);

        expect(particleStateToArray(sut.getParticle(1, 0))).toStrictEqual([10, 20]);
        expect(particleStateToArray(sut.getParticle(1, 1))).toStrictEqual([50, 60]);
        expect(particleStateToArray(sut.getParticle(1, 2))).toStrictEqual([30, 40]);
    });

    test("can reorder particles with filter and repetition", () => {
        const sut = createSystemStateForReorder();
        const reordering = ndArrayFrom([
            [1, 2, 0],
            [2, 0, 2]
        ]);
        sut.reorder(reordering);
        expect(particleStateToArray(sut.getParticle(0, 0))).toStrictEqual([3, 4]);
        expect(particleStateToArray(sut.getParticle(0, 1))).toStrictEqual([5, 6]);
        expect(particleStateToArray(sut.getParticle(0, 2))).toStrictEqual([1, 2]);

        expect(particleStateToArray(sut.getParticle(1, 0))).toStrictEqual([50, 60]);
        expect(particleStateToArray(sut.getParticle(1, 1))).toStrictEqual([10, 20]);
        expect(particleStateToArray(sut.getParticle(1, 2))).toStrictEqual([50, 60]);
    });

    test("throws error when attempt to reorder with unexpected reordering shape", () => {
        const sut = new SystemState(2, 3, 2);
        const reordering = ndarray(new Int32Array(4), [2, 2]);
        expect(() => sut.reorder(reordering)).toThrowError(
            "Unexpected reordering shape. Expected [2,3] but got [2,2]."
        );
    });

    test("throws error when attempt to reorder with negative index", () => {
        const sut = createSystemStateForReorder();
        const reordering = ndArrayFrom([
            [-1, 2, 0],
            [2, 0, 2]
        ]);
        expect(() => sut.reorder(reordering)).toThrowError(
            "Reordering index should be an integer between 0 and 2, but is -1."
        );
    });

    test("throws error when attempt to reorder with index greater than max", () => {
        const sut = createSystemStateForReorder();
        const reordering = ndArrayFrom([
            [1, 2, 0],
            [20, 0, 2]
        ]);
        expect(() => sut.reorder(reordering)).toThrowError(
            "Reordering index should be an integer between 0 and 2, but is 20."
        );
    });
});
