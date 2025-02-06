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

    const expectParticleGroupState = (sys: DiscreteSystem<any>, iGroup: number, nParticles: number, expectedValues: number[]) => {
        const state = sys.getState();
        for (let i = 0; i < nParticles; i++) {
            expect(sys.particleStateToArray(state.getParticle(iGroup, i))).toStrictEqual(expectedValues);
        }
    };

    test("can be initialised", () => {
        const sys = createSystem();
        sys.setStateInitial();

        const expectedGroup1Initial = [
            999999, // shared.N - shared.I0;
            1, // shared.I0;
            0,
            0,
            0
        ];
        expectParticleGroupState(sys, 0, 3, expectedGroup1Initial);

        const expectedGroup2Initial = [
            1999998, // shared.N - shared.I0;
            2, // shared.I0;
            0,
            0,
            0
        ];
        expectParticleGroupState(sys, 1, 3, expectedGroup2Initial);
    });

    test("can set time", () => {
        const sys = createSystem();
        sys.setTime(25);
        expect(sys["time"]).toBe(25);
    });

    test("can run to time", () => {
        const sys = createSystem();
        sys.setStateInitial();
        sys.runToTime(6); // 1 more than start time, should take 2 steps of 0.5

        // Group 1
        const g1StartState = [999999, 1, 0, 0, 0];
        const g1Step1State = new Array<number>(5);
        generator.update(5, 0.5, g1StartState, shared[0], null, g1Step1State);
        const g1Step2State = new Array<number>(5);
        generator.update(5.5, 0.5, g1Step1State, shared[0], null, g1Step2State);
        expectParticleGroupState(sys, 0, 3, g1Step2State);

        // Group 1
        const g2StartState = [1999998, 2, 0, 0, 0];
        const g2Step1State = new Array<number>(5);
        generator.update(5, 0.5, g2StartState, shared[1], null, g2Step1State);
        const g2Step2State = new Array<number>(5);
        generator.update(5.5, 0.5, g2Step1State, shared[1], null, g2Step2State);
        expectParticleGroupState(sys, 1, 3, g2Step2State);
    });
});