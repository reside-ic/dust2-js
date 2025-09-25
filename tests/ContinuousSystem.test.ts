import { describe, test, expect, vi, afterEach } from "vitest";
import { System } from "../src/System.ts";
import { constantGrad, ConstantGradShared } from "./examples/constantGrad.ts";

const generator = constantGrad;

const createSystem = (shared: ConstantGradShared) =>
    System.createODE<ConstantGradShared, null>(
        generator,
        [shared],
        5, // time
        0.001, // dt
        1, // nParticles
        1 // nRhsVariables
    );

describe("ContinuousSystem", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("Can initialise and run to time using constantGrad generator", () => {
        const sys = createSystem({ y: 1, yAddOne: 2 });
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
});
