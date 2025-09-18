import { describe, test, expect, vi, afterEach } from "vitest";
import { System } from "../src/System.ts";
import { constantGrad, ConstantGradShared } from "./examples/constantGrad.ts";
import { constantGradNoUpdate, ConstantGradNoUpdateShared } from "./examples/constantGradNoUpdate.ts";
import { constantGradDelay, ConstantGradDelayShared } from "./examples/constantGradDelay.ts";

describe("ContinuousSystem", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Can initialise and run to time using constantGrad generator", () => {
        const shared = { y: 1, yAddOne: 2 };
        const sys = System.createODE<ConstantGradShared, null>(
            constantGrad,
            [shared],
            5, // time
            0.001, // dt
            1, // nParticles
            undefined
        );
        sys.setStateInitial();
        const result = sys.simulate([6, 7, 8, 9, 10]).resultValues().data;

        // y
        expect(result[0]).toBeCloseTo(2);
        expect(result[1]).toBeCloseTo(3);
        expect(result[2]).toBeCloseTo(4);
        expect(result[3]).toBeCloseTo(101);
        expect(result[4]).toBeCloseTo(102);

        // yAddOne
        expect(result[5]).toBeCloseTo(3);
        expect(result[6]).toBeCloseTo(4);
        expect(result[7]).toBeCloseTo(5);
        expect(result[8]).toBeCloseTo(102);
        expect(result[9]).toBeCloseTo(103);
    });

    test("Can initialise and run to time using constantGradNoUpdate generator", () => {
        const shared = { y: 1, yAddOne: 2 };
        const sys = System.createODE<ConstantGradNoUpdateShared, null>(
            constantGradNoUpdate,
            [shared],
            5, // time
            0.001, // dt
            1, // nParticles
            undefined
        );
        sys.setStateInitial();
        const result = sys.simulate([6, 7, 8, 9, 10]).resultValues().data;

        // y
        expect(result[0]).toBeCloseTo(2);
        expect(result[1]).toBeCloseTo(3);
        expect(result[2]).toBeCloseTo(4);
        expect(result[3]).toBeCloseTo(5);
        expect(result[4]).toBeCloseTo(6);

        // yAddOne
        expect(result[5]).toBeCloseTo(3);
        expect(result[6]).toBeCloseTo(4);
        expect(result[7]).toBeCloseTo(5);
        expect(result[8]).toBeCloseTo(6);
        expect(result[9]).toBeCloseTo(7);
    });

    test("Can initialise and run to time using constantGradDelay generator", () => {
        const shared = { m: 1, x: 1, c: 1, y: 1, yDelay1: 1 };
        const sys = System.createDDE<ConstantGradDelayShared, null>(
            constantGradDelay,
            [shared],
            5, // time
            0.001, // dt
            1, // nParticles
            undefined
        );
        sys.setStateInitial();
        // discontinuities occur at every even time (c reset to zero) and t = 8 (m set to 100)
        // so let's avoid those for now in testing, it will require more thought
        const result = sys.simulate([6.5, 7.5, 8.5, 9.5]).resultValues().data;

        // m
        expect(result[0]).toBeCloseTo(1);
        expect(result[1]).toBeCloseTo(1);
        expect(result[2]).toBeCloseTo(100); // m gets updated to 100 at t = 8
        expect(result[3]).toBeCloseTo(100);

        // x
        expect(result[4]).toBeCloseTo(2.5); // start at x = 1 and dxdt = 1
        expect(result[5]).toBeCloseTo(3.5);
        expect(result[6]).toBeCloseTo(4.5);
        expect(result[7]).toBeCloseTo(5.5);

        // c
        // start at c = 1 and dcdt = 1 and c is reset on even times
        expect(result[8]).toBeCloseTo(0.5);
        expect(result[9]).toBeCloseTo(1.5);
        expect(result[10]).toBeCloseTo(0.5);
        expect(result[11]).toBeCloseTo(1.5);

        // y
        // y = mx + c
        expect(result[12]).toBeCloseTo(3);
        expect(result[13]).toBeCloseTo(5);
        expect(result[14]).toBeCloseTo(450.5);
        expect(result[15]).toBeCloseTo(551.5);

        // y delayed by 1
        // first delayed values corresponds to y value at t = 5.5 which would have
        // m = 1, x = 1.5, c = 1.5
        expect(result[16]).toBeCloseTo(3);
        expect(result[17]).toBeCloseTo(3);
        expect(result[18]).toBeCloseTo(5);
        expect(result[19]).toBeCloseTo(450.5);
    });
});
