import { describe, test, expect, vi, afterEach } from "vitest";
import { discreteSIR } from "./examples/discreteSIR";
import { discreteWalk, WalkShared } from "./examples/discreteWalk.ts";
import { DiscreteSystem } from "../src/DiscreteSystem";
import { particleStateToArray } from "../src/utils";
import { SIRShared } from "./examples/discreteSIR.ts";
import { Random, RngStateBuiltin, RngStateObserved } from "@reside-ic/random";
import { expectedGroup1Initial, expectedGroup2Initial, shared } from "./examples/SIRTestHelpers.ts";

const generator = discreteSIR;

const createSystem = (random?: Random) =>
    new DiscreteSystem<SIRShared, null>(
        generator,
        shared,
        5, // time
        0.5, // dt
        3, // nParticles
        random
    );

const newSIRState = () => new Array<number>(5);

describe("DiscreteSystem", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("can be created", () => {
        const random = new Random(new RngStateBuiltin());
        const sys = createSystem(random);

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

        expectParticleGroupState(sys, 0, 3, expectedGroup1Initial);
        expectParticleGroupState(sys, 1, 3, expectedGroup2Initial);
    });

    test("can set and get time", () => {
        const sys = createSystem();
        sys.time = 25;
        expect(sys.time).toBe(25);
    });

    test("Can initialise and run to time using Walk generator", () => {
        const rngStateObserved = new RngStateObserved(new RngStateBuiltin());
        const random = new Random(rngStateObserved);
        const compareRandom = new Random(rngStateObserved.replay());
        const np = 5;
        const walkShared = { n: 3, sd: 1 };
        const sys = new DiscreteSystem<WalkShared, null>(
            discreteWalk,
            [walkShared],
            0, // time
            1, // dt
            np, // nParticles
            random
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

    test("can initialise and run to time using SIR generator", () => {
        const rngStateObserved = new RngStateObserved(new RngStateBuiltin());
        const random = new Random(rngStateObserved);
        const compareRandom = new Random(rngStateObserved.replay());

        const start = 5;
        const step1 = 5.5;
        const dt = 0.5;

        const sys = new DiscreteSystem<SIRShared, null>(
            generator,
            shared,
            start, // time
            dt, // dt
            2, // nParticles
            random
        );
        sys.setStateInitial();
        sys.runToTime(6); // 1 more than start time, should take 2 steps of 0.5

        const g1StartState = [999999, 1, 0, 0, 0];
        const g2StartState = [1999998, 2, 0, 0, 0];

        // Simulate each of the updates called by the System, using the compareRandom to replay the
        // same random values in order so we get the same results
        // 2 Groups (g) and 2 Particles (p)

        // Group 1
        const g1Shared = shared[0];
        const g1p1Step1State = newSIRState();
        generator.update(start, dt, g1StartState, g1Shared, null, g1p1Step1State, compareRandom);
        const g1p1Step2State = newSIRState();
        generator.update(step1, dt, g1p1Step1State, g1Shared, null, g1p1Step2State, compareRandom);

        const g1p2Step1State = newSIRState();
        generator.update(start, dt, g1StartState, g1Shared, null, g1p2Step1State, compareRandom);
        const g1p2Step2State = newSIRState();
        generator.update(step1, dt, g1p2Step1State, g1Shared, null, g1p2Step2State, compareRandom);

        // Group 2
        const g2Shared = shared[1];
        const g2p1Step1State = newSIRState();
        generator.update(start, dt, g2StartState, g2Shared, null, g2p1Step1State, compareRandom);
        const g2p1Step2State = newSIRState();
        generator.update(step1, dt, g2p1Step1State, g2Shared, null, g2p1Step2State, compareRandom);

        const g2p2Step1State = newSIRState();
        generator.update(start, dt, g2StartState, g2Shared, null, g2p2Step1State, compareRandom);
        const g2p2Step2State = new Array<number>(5);
        generator.update(step1, dt, g2p2Step1State, g2Shared, null, g2p2Step2State, compareRandom);

        expect(particleStateToArray(sys.state.getParticle(0, 0))).toStrictEqual(g1p1Step2State);
        expect(particleStateToArray(sys.state.getParticle(0, 1))).toStrictEqual(g1p2Step2State);
        expect(particleStateToArray(sys.state.getParticle(1, 0))).toStrictEqual(g2p1Step2State);
        expect(particleStateToArray(sys.state.getParticle(1, 1))).toStrictEqual(g2p2Step2State);
    });

    test("throws expected error if run to time which is before current time", () => {
        const sys = createSystem();
        sys.setStateInitial();
        expect(() => sys.runToTime(1)).toThrowError(
            "Cannot run to requested time 1, which is less than current time 5."
        );
    });
});
