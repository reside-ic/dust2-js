import { describe, test, expect, vi, afterEach } from "vitest";
import { System } from "../src/System.ts";
import { constantGrad, ConstantGradShared } from "./examples/constantGrad.ts";
import { constantGradNoUpdate, ConstantGradNoUpdateShared } from "./examples/constantGradNoUpdate.ts";

const createSystem = (shared: ConstantGradShared, dt = 0.001) =>
    System.createODE<ConstantGradShared, null>(
        constantGrad,
        [shared],
        5, // time
        dt, // dt
        1, // nParticles
        1 // nRhsVariables
    );

const createSystemNoUpdate = (shared: ConstantGradNoUpdateShared) =>
    System.createODE<ConstantGradNoUpdateShared, null>(
        constantGradNoUpdate,
        [shared],
        5, // time
        0.001, // dt
        1, // nParticles
        1 // nRhsVariables
    );

type ExpectedResult = {
    y: number[];
    yAddOne: number[];
};

const expectResult = (sys: System<any, any, any>, expectedResult: ExpectedResult) => {
    sys.setStateInitial();
    const result = sys.simulate([6, 7, 8, 9, 10]).resultValues().data;

    // y
    expect(result[0]).toBeCloseTo(expectedResult.y[0]);
    expect(result[1]).toBeCloseTo(expectedResult.y[1]);
    expect(result[2]).toBeCloseTo(expectedResult.y[2]);
    expect(result[3]).toBeCloseTo(expectedResult.y[3]);
    expect(result[4]).toBeCloseTo(expectedResult.y[4]);

    // yAddOne
    expect(result[5]).toBeCloseTo(expectedResult.yAddOne[0]);
    expect(result[6]).toBeCloseTo(expectedResult.yAddOne[1]);
    expect(result[7]).toBeCloseTo(expectedResult.yAddOne[2]);
    expect(result[8]).toBeCloseTo(expectedResult.yAddOne[3]);
    expect(result[9]).toBeCloseTo(expectedResult.yAddOne[4]);
};

describe("ContinuousSystem", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Can initialise and run to time using constantGrad generator", () => {
        const sys = createSystem({ y: 1, yAddOne: 2 });
        expectResult(sys, {
            y: [2, 3, 4, 101, 102],
            yAddOne: [3, 4, 5, 102, 103]
        });
    });

    test("providing dt <= 0 or Infinity ignores update", () => {
        let sys = createSystem({ y: 1, yAddOne: 2 }, -1);
        expectResult(sys, {
            y: [2, 3, 4, 5, 6],
            yAddOne: [3, 4, 5, 6, 7]
        });

        sys = createSystem({ y: 1, yAddOne: 2 }, 0);
        expectResult(sys, {
            y: [2, 3, 4, 5, 6],
            yAddOne: [3, 4, 5, 6, 7]
        });

        sys = createSystem({ y: 1, yAddOne: 2 }, Infinity);
        expectResult(sys, {
            y: [2, 3, 4, 5, 6],
            yAddOne: [3, 4, 5, 6, 7]
        });
    });

    test("Can initialise and run to time using constantGradNoUpdate generator", () => {
        const sys = createSystemNoUpdate({ y: 1, yAddOne: 2 });
        expectResult(sys, {
            y: [2, 3, 4, 5, 6],
            yAddOne: [3, 4, 5, 6, 7]
        });
    });
});
