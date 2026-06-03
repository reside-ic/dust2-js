import type { ContinuousGeneratorDDE } from "../../src/interfaces/generators/ContinuousGenerator.ts";

export interface ConstantGradDelayParams {
    m: number;
    x: number;
    c: number;
    y: number;
    yDelay1: number;
}

export const constantGradDelay: ContinuousGeneratorDDE<ConstantGradDelayParams, null, null> = {
    initial(_imports, time: number, params, internal: null, stateNext: number[]) {
        stateNext[0] = params.m;
        stateNext[1] = params.x;
        stateNext[2] = params.c;
        stateNext[3] = params.y;
        stateNext[4] = params.yDelay1;
    },

    rhs(_imports, t, y, dydt) {
        dydt[0] = 0;
        dydt[1] = 1;
        dydt[2] = 1;
    },

    output(_imports, t, y, solution) {
        const output = Array(2);
        output[0] = y[0] * y[1] + y[2];
        const [mDelay, xDelay, cDelay] = solution(t - 1);
        output[1] = mDelay * xDelay + cDelay;
        return output;
    },

    update(_imports, time: number, dt: number, state: number[], params, internal: null, stateNext: number[]) {
        if (Math.abs(time - 8) < 1e-10) {
            stateNext[0] = 100;
        }
    },

    getZeroEvery() {
        return [[2, [2]]];
    },

    internal(): null {
        return null;
    },

    buildParams(imports, params) {
        const shape = new Map<string, number[]>();
        shape.set("gradient", []);
        shape.set("X", []);
        shape.set("intercept", []);
        shape.set("Y", []);
        shape.set("Y delayed by 1", []);
        return { ...params, dim: { shape }};
    },

    updateParams(_imports, params, newParams) {
        params.m = newParams.m;
        params.x = newParams.x;
        params.c = newParams.c;
        params.y = newParams.y;
        params.yDelay1 = newParams.yDelay1;
    }
};
