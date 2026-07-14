import { describe, test, expect } from "vitest";
import { SystemState, SystemSubState } from "../src/SystemState.ts";
import { ndArrayFrom, arrayStateToArray } from "../src/utils.ts";
import ndarray from "ndarray";

describe("SystemState", () => {
    const createSystemState = () => new SystemState(3, 4);

    test("can get nParticles", () => {
        expect(createSystemState().nParticles).toBe(3);
    });

    test("can get nStateElements", () => {
        expect(createSystemState().nStateElements).toBe(4);
    });

    test("can set and get particles", () => {
        const sut = createSystemState();
        sut.setParticle(1, [10, 20, 30, 40]);

        expect(arrayStateToArray(sut.getParticle(1))).toStrictEqual([10, 20, 30, 40]);
    });

    test("throws error when attempt get with invalid index", () => {
        const sut = createSystemState();
        expect(() => sut.getParticle(3)).toThrowError("Particle index should be an integer between 0 and 2, but is 3.");
        expect(() => sut.getParticle(1.1)).toThrowError(
            "Particle index should be an integer between 0 and 2, but is 1.1."
        );
    });

    test("throws error when attempt set with array of incorrect length", () => {
        const sut = createSystemState();
        expect(() => sut.setParticle(0, [0, 1])).toThrowError("Particle state array must be of length 4.");
    });

    const createSystemStateForReorder = () => {
        const sut = new SystemState(3, 2);

        // Initial State
        sut.setParticle(0, [1, 2]);
        sut.setParticle(1, [3, 4]);
        sut.setParticle(2, [5, 6]);
        return sut;
    };

    test("can reorder particles", () => {
        const sut = createSystemStateForReorder();
        let reordering = ndArrayFrom([1, 2, 0]);
        sut.reorder(reordering);

        expect(arrayStateToArray(sut.getParticle(0))).toStrictEqual([3, 4]);
        expect(arrayStateToArray(sut.getParticle(1))).toStrictEqual([5, 6]);
        expect(arrayStateToArray(sut.getParticle(2))).toStrictEqual([1, 2]);

        // Test that successive reordering work as expected
        reordering = ndArrayFrom([2, 1, 0]);
        sut.reorder(reordering);
        expect(arrayStateToArray(sut.getParticle(0))).toStrictEqual([1, 2]);
        expect(arrayStateToArray(sut.getParticle(1))).toStrictEqual([5, 6]);
        expect(arrayStateToArray(sut.getParticle(2))).toStrictEqual([3, 4]);
    });

    test("can reorder particles with filter and repetition", () => {
        const sut = createSystemStateForReorder();
        const reordering = ndArrayFrom([2, 0, 2]);
        sut.reorder(reordering);
        expect(arrayStateToArray(sut.getParticle(0))).toStrictEqual([5, 6]);
        expect(arrayStateToArray(sut.getParticle(1))).toStrictEqual([1, 2]);
        expect(arrayStateToArray(sut.getParticle(2))).toStrictEqual([5, 6]);
    });

    test("throws error when attempt to reorder with unexpected reordering shape", () => {
        const sut = new SystemState(3, 2);
        const reordering = ndarray(new Int32Array(4), [2]);
        expect(() => sut.reorder(reordering)).toThrowError("Unexpected reordering shape. Expected [3] but got [2].");
    });

    test("throws error when attempt to reorder with negative index", () => {
        const sut = createSystemStateForReorder();
        const reordering = ndArrayFrom([-1, 2, 0]);
        expect(() => sut.reorder(reordering)).toThrowError(
            "Reordering index should be an integer between 0 and 2, but is -1."
        );
    });

    test("throws error when attempt to reorder with index greater than max", () => {
        const sut = createSystemStateForReorder();
        const reordering = ndArrayFrom([20, 0, 2]);
        expect(() => sut.reorder(reordering)).toThrowError(
            "Reordering index should be an integer between 0 and 2, but is 20."
        );
    });

    test("can set full state", () => {
        const sut = createSystemState(); // 3, 4
        const fullState: SystemSubState = [
            [0, 1, 2, 3],
            [4, 5, 6, 7],
            [8, 9, 10, 11]
        ];
        sut.setState(fullState);
        expect(arrayStateToArray(sut.getParticle(0))).toStrictEqual([0, 1, 2, 3]);
        expect(arrayStateToArray(sut.getParticle(1))).toStrictEqual([4, 5, 6, 7]);
        expect(arrayStateToArray(sut.getParticle(2))).toStrictEqual([8, 9, 10, 11]);
    });

    test("can set substate", () => {
        const sut = createSystemState(); // 3, 4
        const subState: SystemSubState = [[98, 76]];

        // 2nd particle only, 2nd and 4th state elements
        sut.setState(subState, [1], [1, 3]);
        expect(arrayStateToArray(sut.getParticle(0))).toStrictEqual([0, 0, 0, 0]);
        expect(arrayStateToArray(sut.getParticle(1))).toStrictEqual([0, 98, 0, 76]);
        expect(arrayStateToArray(sut.getParticle(2))).toStrictEqual([0, 0, 0, 0]);
    });

    test("throws expected error when full state is the wrong shape", () => {
        const sut = createSystemState(); // 2, 3, 4
        const fullState: SystemSubState = [
            [0, 1, 2, 3],
            [4, 5, 6, 7],
            [8, 9, 10, 11, 11]
        ];
        expect(() => sut.setState(fullState)).toThrow("State Elements should have length 4 but was 5 at index 2");
    });

    test("throws expected error when substate is the wrong shape", () => {
        const sut = createSystemState(); // 2, 3, 4
        const subState: SystemSubState = [[98, 76]];

        expect(() => sut.setState(subState, [0, 1], [1, 3])).toThrow("Particles should have length 2 but was 1");
    });

    test("throws expected error when substate indices are invalid for system", () => {
        const sut = createSystemState();
        const subState: SystemSubState = [[98, 76]];
        expect(() => sut.setState(subState, [8], [1, 3])).toThrow(
            "Particle index should be an integer between 0 and 2, but is 8"
        );
    });

    test("throws expected error when substate indices are invalid", () => {
        const sut = createSystemState();
        const subState: SystemSubState = [[98, 76]];
        expect(() => sut.setState(subState, [-1], [1, 3])).toThrow(
            "Particle index should be an integer between 0 and 2, but is -1"
        );
    });
});
