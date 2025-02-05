import { describe, test, expect } from "vitest";
import { DiscreteSIR } from "./examples/sir";
import { DiscreteSystem } from "../src/DiscreteSystem.ts";

const generator = new DiscreteSIR();
const shared = [
    { N: 1000000, I0: 1, beta: 4, gamma: 2},
    { N: 2000000, I0: 2, beta: 8, gamma: 4},
];

const createSystem = () => new DiscreteSystem<DiscreteSIR>(
    generator,
    shared,
    5, // time
    0.5, // dt
    3 // nParticles
);

describe("DiscreteSystem", () => {
    test("can be created", () => {
        const sys = createSystem();

        expect(sys["generator"]).toBe(generator);
        expect(sys["time"]).toBe(5);
        expect(sys["dt"]).toBe(0.5);
        expect(sys["nParticles"]).toBe(3);
        expect(sys["nGroups"]).toBe(2);

        const packer = sys["statePacker"];
        expect(packer.length).toBe(5);

        const state = sys["state"];
        expect(state["nGroups"]).toBe(2);
        expect(state["nParticles"]).toBe(3);
        expect(state["nStateElements"]).toBe(5);

        expect(sys["shared"]).toBe(shared);
        expect(sys["internal"]).toStrictEqual([null, null]);
    });

    test("can be initialised", () => {
        const sys = createSystem();
        sys.setStateInitial();
        const state = sys.getState();

        const expectedGroup1Initial = [
            999999, // shared.N - shared.I0;
            1, // shared.I0;
            0,
            0,
            0
        ];
        expect(sys.particleStateToArray(state.getParticle(0, 0))).toStrictEqual(expectedGroup1Initial);
        expect(sys.particleStateToArray(state.getParticle(0, 1))).toStrictEqual(expectedGroup1Initial);
        expect(sys.particleStateToArray(state.getParticle(0, 2))).toStrictEqual(expectedGroup1Initial);

        const expectedGroup2Initial = [
            1999998, // shared.N - shared.I0;
            2, // shared.I0;
            0,
            0,
            0
        ];
        expect(sys.particleStateToArray(state.getParticle(1, 0))).toStrictEqual(expectedGroup2Initial);
        expect(sys.particleStateToArray(state.getParticle(1, 1))).toStrictEqual(expectedGroup2Initial);
        expect(sys.particleStateToArray(state.getParticle(1, 2))).toStrictEqual(expectedGroup2Initial);
    });

    test("can run to time", () => {});
});