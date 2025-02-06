import { describe, test, expect } from "vitest";
import { DiscreteSIR } from "./examples/DiscreteSIR";
import { DiscreteSystem } from "../src/DiscreteSystem";
import { particleStateToArray } from "../src/utils";

const generator = new DiscreteSIR();
const shared = [
    { N: 1000000, I0: 1, beta: 4, gamma: 2 },
    { N: 2000000, I0: 2, beta: 8, gamma: 4 }
];

const createSystem = () =>
    new DiscreteSystem<DiscreteSIR>(
        generator,
        shared,
        5, // time
        0.5, // dt
        3 // nParticles
    );

describe("DiscreteSystem", () => {
    test("can be created", () => {
        const sys = createSystem();

        expect(sys["_generator"]).toBe(generator);
        expect(sys["_time"]).toBe(5);
        expect(sys["_dt"]).toBe(0.5);
        expect(sys["_nParticles"]).toBe(3);
        expect(sys["_nGroups"]).toBe(2);

        const packer = sys["_statePacker"];
        expect(packer.length).toBe(5);

        const state = sys["_state"];
        expect(state["_nGroups"]).toBe(2);
        expect(state["_nParticles"]).toBe(3);
        expect(state["_nStateElements"]).toBe(5);

        expect(sys["_shared"]).toBe(shared);
        expect(sys["_internal"]).toStrictEqual([null, null]);
    });

    test("constructor throws error if nParticles is invalid", () => {
        expect(
            () =>
                new DiscreteSystem<DiscreteSIR>(
                    generator,
                    shared,
                    5, // time
                    0.5, // dt
                    -3 // nParticles
                )
        ).toThrowError("Number of particles should be an integer greater than or equal to 1, but is -3.");

        expect(
            () =>
                new DiscreteSystem<DiscreteSIR>(
                    generator,
                    shared,
                    5, // time
                    0.5, // dt
                    3.1 // nParticles
                )
        ).toThrowError("Number of particles should be an integer greater than or equal to 1, but is 3.1.");
    });

    const expectParticleGroupState = (
        sys: DiscreteSystem<any>,
        iGroup: number,
        nParticles: number,
        expectedValues: number[]
    ) => {
        const state = sys.state;
        for (let i = 0; i < nParticles; i++) {
            expect(particleStateToArray(state.getParticle(iGroup, i))).toStrictEqual(expectedValues);
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
        expect(sys["_time"]).toBe(25);
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

    test("throws expected error if run to time which is before current time", () => {
        const sys = createSystem();
        sys.setStateInitial();
        expect(() => sys.runToTime(1)).toThrowError(
            "Cannot run to requested time 1, which is less than current time 5."
        );
    });
});
