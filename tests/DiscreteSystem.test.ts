import { describe, test, expect } from "vitest";
import { discreteSIR } from "./examples/discreteSIR";
import { discreteWalk, WalkShared } from "./examples/discreteWalk.ts";
import { DiscreteSystem } from "../src/DiscreteSystem";
import { particleStateToArray } from "../src/utils";
import { SIRShared } from "./examples/discreteSIR.ts";
import { Random, RngStateBuiltin, RngStateObserved } from "@reside-ic/random";

const generator = discreteSIR;
const shared = [
    { N: 1000000, I0: 1, beta: 4, gamma: 2 },
    { N: 2000000, I0: 2, beta: 8, gamma: 4 }
];

const random = new Random(new RngStateBuiltin());

const createSystem = () =>
    new DiscreteSystem<SIRShared, null>(
        generator,
        shared,
        5, // time
        0.5, // dt
        3, // nParticles
        random
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

        expect(sys["_random"]).toBe(random);
    });

    test("defaults to built in random", () => {
        const sys = new DiscreteSystem<SIRShared, null>(
            generator,
            shared,
            5, // time
            0.5, // dt
            3 // nParticles
        );
        const defaultRandom = sys["_random"];
        expect(defaultRandom.state).toBeInstanceOf(RngStateBuiltin);
    });

    test("constructor throws error if nParticles is invalid", () => {
        expect(
            () =>
                new DiscreteSystem<SIRShared, null>(
                    generator,
                    shared,
                    5, // time
                    0.5, // dt
                    -3 // nParticles
                )
        ).toThrowError("Number of particles should be an integer greater than or equal to 1, but is -3.");

        expect(
            () =>
                new DiscreteSystem<SIRShared, null>(
                    generator,
                    shared,
                    5, // time
                    0.5, // dt
                    3.1 // nParticles
                )
        ).toThrowError("Number of particles should be an integer greater than or equal to 1, but is 3.1.");
    });

    const expectParticleGroupState = (
        sys: DiscreteSystem<any, any>,
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

    test("can set and get time", () => {
        const sys = createSystem();
        sys.time = 25;
        expect(sys.time).toBe(25);
    });

    test("can run to time", () => {
        const sys = createSystem();
        sys.setStateInitial();
        sys.runToTime(6); // 1 more than start time, should take 2 steps of 0.5

        // Group 1
        const g1StartState = [999999, 1, 0, 0, 0];
        const g1Step1State = new Array<number>(5);
        generator.update(5, 0.5, g1StartState, shared[0], null, g1Step1State, random);
        const g1Step2State = new Array<number>(5);
        generator.update(5.5, 0.5, g1Step1State, shared[0], null, g1Step2State, random);
        expectParticleGroupState(sys, 0, 3, g1Step2State);

        // Group 1
        const g2StartState = [1999998, 2, 0, 0, 0];
        const g2Step1State = new Array<number>(5);
        generator.update(5, 0.5, g2StartState, shared[1], null, g2Step1State, random);
        const g2Step2State = new Array<number>(5);
        generator.update(5.5, 0.5, g2Step1State, shared[1], null, g2Step2State, random);
        expectParticleGroupState(sys, 1, 3, g2Step2State);
    });

    test("throws expected error if run to time which is before current time", () => {
        const sys = createSystem();
        sys.setStateInitial();
        expect(() => sys.runToTime(1)).toThrowError(
            "Cannot run to requested time 1, which is less than current time 5."
        );
    });

    test("Can initialise and run to time using Random", () => {
        const rngStateObserved = new RngStateObserved(new RngStateBuiltin());
        const rnd = new Random(rngStateObserved);
        const compareRandom = new Random(rngStateObserved.replay());
        const np = 5;
        const walkShared = { n: 3, sd: 1 };
        const sys = new DiscreteSystem<WalkShared, null>(
            discreteWalk,
            [walkShared],
            0, // time
            1, // dt
            np, // nParticles
            rnd
        );
        sys.runToTime(2);
        // each particle runs to time in turn, and at each time point takes values for each state value
        for (let i = 0; i < np; i++) {
            const expectedT1 = [...new Array(3)].map((t) => compareRandom.randomNormal());
            const expectedT2 = expectedT1.map((t1) => t1 + compareRandom.randomNormal());
            const particle = sys.state.getParticle(0, i);
            expect(particleStateToArray(particle)).toStrictEqual(expectedT2);
        }
        expect(sys.time).toEqual(2);
    });
});
