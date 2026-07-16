import { describe, test, expect, vi, afterEach } from "vitest";
import { discreteSIR, SIRData } from "./examples/discreteSIR.ts";
import { discreteWalk, WalkParams } from "./examples/discreteWalk.ts";
import { System } from "../src/System.ts";
import { arrayStateToArray } from "../src/utils.ts";
import { SIRParams } from "./examples/discreteSIR.ts";
import { Random, RngStateBuiltin, RngStateObserved } from "@reside-ic/random";
import { expectedInitial, sirParams } from "./examples/SIRTestHelpers.ts";
import { imports } from "../src/interfaces/generators/Imports.ts";

const generator = discreteSIR;

const createSystem = (random?: Random) =>
    System.createDiscrete<SIRParams, null, SIRData>(
        generator,
        sirParams,
        5, // time
        0.5, // dt
        3, // nParticles
        undefined, // nRhsVariables
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

        expect(sys["_generatorCfg"]).toStrictEqual({ generator, isContinuous: false, hasDelays: false });
        expect(sys["_time"]).toBe(5);
        expect(sys["_dt"]).toBe(0.5);
        expect(sys["_nParticles"]).toBe(3);

        const packer = sys["_statePacker"];
        expect(packer.length).toBe(5);

        const state = sys["_state"];
        expect(state["_nParticles"]).toBe(3);
        expect(state["_nStateElements"]).toBe(5);

        const { dim: _d, odin: _o, ...sysParams } = sys["_params"];
        expect(sysParams).toStrictEqual(sirParams);
        expect(sys["_internal"]).toStrictEqual(null);

        expect(sys["_random"]).toBe(random);
    });

    test("defaults to built in random", () => {
        const sys = System.createDiscrete<SIRParams, null, SIRData>(
            generator,
            sirParams,
            5, // time
            0.5, // dt
            3 // nParticles
        );
        const defaultRandom = sys["_random"];
        expect(defaultRandom.state).toBeInstanceOf(RngStateBuiltin);
    });

    test("constructor throws error if nParticles is invalid", () => {
        expect(() =>
            System.createDiscrete<SIRParams, null, SIRData>(
                generator,
                sirParams,
                5, // time
                0.5, // dt
                -3 // nParticles
            )
        ).toThrowError("Number of particles should be an integer greater than or equal to 1, but is -3.");

        expect(() =>
            System.createDiscrete<SIRParams, null, SIRData>(
                generator,
                sirParams,
                5, // time
                0.5, // dt
                3.1 // nParticles
            )
        ).toThrowError("Number of particles should be an integer greater than or equal to 1, but is 3.1.");
    });

    test("throws expected error dt <= 0 or dt is Infinity", () => {
        expect(() =>
            System.createDiscrete<SIRParams, null, SIRData>(
                generator,
                sirParams,
                5, // time
                -1, // dt
                3 // nParticles
            )
        ).toThrowError("dt provided, -1, must be positive and finite");

        expect(() =>
            System.createDiscrete<SIRParams, null, SIRData>(
                generator,
                sirParams,
                5, // time
                Infinity, // dt
                3 // nParticles
            )
        ).toThrowError("dt provided, Infinity, must be positive and finite");
    });

    const expectParticleState = (sys: System<any, any, any>, nParticles: number, expectedValues: number[]) => {
        const state = sys.state;
        for (let i = 0; i < nParticles; i++) {
            expect(arrayStateToArray(state.getParticle(i))).toStrictEqual(expectedValues);
        }
    };

    test("can be initialised", () => {
        const sys = createSystem();
        sys.setStateInitial();

        expectParticleState(sys, 3, expectedInitial);
    });

    test("can set substate", () => {
        const sys = createSystem();
        sys.setStateInitial();
        const subState = [[17, 18]];
        sys.setState(subState, [2], [3, 4]);
        expect(arrayStateToArray(sys.state.getParticle(2))).toStrictEqual([
            999999, // params.N - params.I0;
            1, // params.I0;
            0,
            17,
            18
        ]); // expectedIntial with the updated values
    });

    test("can set full state", () => {
        const sys = createSystem();
        sys.setStateInitial();

        const newPart1 = [11111, 1, 2, 3, 4];
        const newPart2 = [22222, 2, 3, 4, 5];
        const newPart3 = [33333, 3, 4, 5, 6];

        const newState = [newPart1, newPart2, newPart3];

        sys.setState(newState);

        expect(arrayStateToArray(sys.state.getParticle(0))).toStrictEqual(newPart1);
        expect(arrayStateToArray(sys.state.getParticle(1))).toStrictEqual(newPart2);
        expect(arrayStateToArray(sys.state.getParticle(2))).toStrictEqual(newPart3);
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
        const walkParams = { n: 3, sd: 1 };
        const sys = System.createDiscrete<WalkParams, null>(
            discreteWalk,
            walkParams,
            0, // time
            1, // dt
            np, // nParticles
            undefined, // nRhsVariables
            random
        );
        sys.runToTime(2);
        // each particle runs to time in turn, and at each time point takes values for each state value
        for (let i = 0; i < np; i++) {
            const expectedT1 = [...new Array(3)].map((t) => compareRandom.randomNormal());
            const expectedT2 = expectedT1.map((t1) => t1 + compareRandom.randomNormal());
            const particle = sys.state.getParticle(i);
            expect(arrayStateToArray(particle)).toStrictEqual(expectedT2);
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

        const sys = System.createDiscrete<SIRParams, null, SIRData>(
            generator,
            sirParams,
            start, // time
            dt, // dt
            2, // nParticles
            undefined, // nRhsVariables
            random
        );
        sys.setStateInitial();
        sys.runToTime(6); // 1 more than start time, should take 2 steps of 0.5

        const startState = [999999, 1, 0, 0, 0];

        // Simulate each of the updates called by the System, using the compareRandom to replay the
        // same random values in order so we get the same results

        const p1Step1State = newSIRState();
        generator.update(imports, start, dt, startState, sirParams, null, p1Step1State, compareRandom);
        const p1Step2State = newSIRState();
        generator.update(imports, step1, dt, p1Step1State, sirParams, null, p1Step2State, compareRandom);

        const p2Step1State = newSIRState();
        generator.update(imports, start, dt, startState, sirParams, null, p2Step1State, compareRandom);
        const p2Step2State = newSIRState();
        generator.update(imports, step1, dt, p2Step1State, sirParams, null, p2Step2State, compareRandom);

        expect(arrayStateToArray(sys.state.getParticle(0))).toStrictEqual(p1Step2State);
        expect(arrayStateToArray(sys.state.getParticle(1))).toStrictEqual(p2Step2State);
    });

    test("throws expected error if run to time which is before current time", () => {
        const sys = createSystem();
        sys.setStateInitial();
        expect(() => sys.runToTime(1)).toThrowError(
            "Cannot run to requested time 1, which is less than current time 5."
        );
    });

    test("can update params", () => {
        const sys = createSystem();
        const newParams = { N: 3000000, I0: 10, beta: 40, gamma: 20 };
        sys.updateParams(newParams);
        const { dim: _d, odin: _o, ...sysParams } = sys["_params"];
        // Expect all values except N to have been updated
        expect(sysParams).toStrictEqual({ N: 1000000, I0: 10, beta: 40, gamma: 20 });
    });

    const simulateParams = { N: 1000000, I0: 1, beta: 4, gamma: 2 };
    const startState = [999999, 1, 0, 0, 0];

    // Helper for simulate tests - manually run each of the updates called by the System, using the compareRandom to
    // replay the same random values in order so we get the same results
    const getNextState = (start, currentState, params, dt, random) => {
        const nextState = newSIRState();
        generator.update(imports, start, dt, currentState, params, null, nextState, random);
        return nextState;
    };

    test("can simulate using SIR generator", () => {
        const rngStateObserved = new RngStateObserved(new RngStateBuiltin());
        const random = new Random(rngStateObserved);
        const compareRandom = new Random(rngStateObserved.replay());

        const start = 5;
        const step1 = 5.5;
        const step2 = 6;
        const step3 = 6.5;
        const dt = 0.5;

        const sys = System.createDiscrete<SIRParams, null, SIRData>(
            generator,
            simulateParams,
            start, // time
            dt, // dt
            2, // nParticles
            undefined, // nRhsVariables
            random
        );
        sys.setStateInitial();

        const result = sys.simulate([6, 7], [0, 2, 4]); // 1 and 2 more than start time, should take 4 steps of 0.5

        // TIME 6
        const p1Step1State = getNextState(start, startState, simulateParams, dt, compareRandom);
        const p1Step2State = getNextState(step1, p1Step1State, simulateParams, dt, compareRandom);

        const p2Step1State = getNextState(start, startState, simulateParams, dt, compareRandom);
        const p2Step2State = getNextState(step1, p2Step1State, simulateParams, dt, compareRandom);

        // TIME 7
        const p1Step3State = getNextState(step2, p1Step2State, simulateParams, dt, compareRandom);
        const p1Step4State = getNextState(step3, p1Step3State, simulateParams, dt, compareRandom);

        const p2Step3State = getNextState(step2, p2Step2State, simulateParams, dt, compareRandom);
        const p2Step4State = getNextState(step3, p2Step3State, simulateParams, dt, compareRandom);

        // Test can get expected state element values for both times
        // State element indexes 0, 1, 2 in result should map to 0, 2, 4 in full state
        expect(arrayStateToArray(result.getStateElement(0, 0))).toStrictEqual([p1Step2State[0], p1Step4State[0]]);
        expect(arrayStateToArray(result.getStateElement(0, 1))).toStrictEqual([p1Step2State[2], p1Step4State[2]]);
        expect(arrayStateToArray(result.getStateElement(0, 2))).toStrictEqual([p1Step2State[4], p1Step4State[4]]);

        expect(arrayStateToArray(result.getStateElement(1, 0))).toStrictEqual([p2Step2State[0], p2Step4State[0]]);
        expect(arrayStateToArray(result.getStateElement(1, 1))).toStrictEqual([p2Step2State[2], p2Step4State[2]]);
        expect(arrayStateToArray(result.getStateElement(1, 2))).toStrictEqual([p2Step2State[4], p2Step4State[4]]);

        // Test can get get all state values for a time (for a particle) - NB "iTime" param here is time index,
        // not time value.
        // Group 1
        expect(arrayStateToArray(result.getValuesForTime(0, 0))).toStrictEqual([
            p1Step2State[0],
            p1Step2State[2],
            p1Step2State[4]
        ]);
        expect(arrayStateToArray(result.getValuesForTime(0, 1))).toStrictEqual([
            p1Step4State[0],
            p1Step4State[2],
            p1Step4State[4]
        ]);
        expect(arrayStateToArray(result.getValuesForTime(1, 0))).toStrictEqual([
            p2Step2State[0],
            p2Step2State[2],
            p2Step2State[4]
        ]);
        expect(arrayStateToArray(result.getValuesForTime(1, 1))).toStrictEqual([
            p2Step4State[0],
            p2Step4State[2],
            p2Step4State[4]
        ]);
    });

    test("can run simulate where first time is current time", () => {
        const rngStateObserved = new RngStateObserved(new RngStateBuiltin());
        const random = new Random(rngStateObserved);
        const compareRandom = new Random(rngStateObserved.replay());

        const start = 5;
        const step1 = 5.5;
        const dt = 0.5;

        const sys = System.createDiscrete<SIRParams, null, SIRData>(
            generator,
            simulateParams,
            start, // time
            dt, // dt
            1, // nParticles
            undefined, // nRhsVariables
            random
        );
        sys.setStateInitial();

        const result = sys.simulate([5, 6]); // 0 and 1 more than start time, should take 2 steps of 0.5

        // TIME 6
        const p1Step1State = getNextState(start, startState, simulateParams, dt, compareRandom);
        const p1Step2State = getNextState(step1, p1Step1State, simulateParams, dt, compareRandom);

        // Test can get expected state element values for both times

        [...Array(5).keys()].map((stateElIdx) => {
            // Group 1
            expect(arrayStateToArray(result.getStateElement(0, stateElIdx))).toStrictEqual([
                startState[stateElIdx],
                p1Step2State[stateElIdx]
            ]);
        });

        // Test can get get all state values for a time (for a particle)
        expect(arrayStateToArray(result.getValuesForTime(0, 0))).toStrictEqual(startState);
        expect(arrayStateToArray(result.getValuesForTime(0, 1))).toStrictEqual(p1Step2State);
    });

    test("simulate throws error if times are not valid", () => {
        const sys = createSystem();
        expect(() => sys.simulate([0, 1])).toThrow("Times must be greater than or equal to 5, but found 0.");
        expect(() => sys.simulate([6, 5])).toThrow("Times must be ordered with no duplicates.");
        expect(() => sys.simulate([6, 6])).toThrow("Times must be ordered with no duplicates.");
    });

    test("simulate throws error state element indexes are not valid", () => {
        // We currently enforce ordering and non-duplicate on state elements, which isn't
        // strictly necessary
        const sys = createSystem();
        expect(() => sys.simulate([5, 6], [-1, 0])).toThrow(
            "State Element should be an integer between 0 and 4, but is -1"
        );
        expect(() => sys.simulate([5, 6], [0, 6])).toThrow(
            "State Element should be an integer between 0 and 4, but is 6"
        );
        expect(() => sys.simulate([5, 6], [3, 2])).toThrow("State Element indices must be ordered with no duplicates");
        expect(() => sys.simulate([5, 6], [2, 2])).toThrow("State Element indices must be ordered with no duplicates");
    });
});
