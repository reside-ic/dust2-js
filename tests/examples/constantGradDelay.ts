import type { ContinuousGeneratorDDE } from "../../src/interfaces/generators/ContinuousGenerator.ts";

export interface ConstantGradDelayShared {
    m: number;
    x: number;
    c: number;
    y: number;
    yDelay1: number;
}

export const constantGradDelay: ContinuousGeneratorDDE<ConstantGradDelayShared, null, null> = {
    initial(_imports, time: number, shared, internal: null, stateNext: number[]) {
        stateNext[0] = shared.m;
        stateNext[1] = shared.x;
        stateNext[2] = shared.c;
        stateNext[3] = shared.y;
        stateNext[4] = shared.yDelay1;
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

    update(_imports, time: number, dt: number, state: number[], shared, internal: null, stateNext: number[]) {
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

    packingState(imports) {
        const shape = new Map<string, number[]>([
            ["gradient", []],
            ["X", []],
            ["intercept", []],
            ["Y", []],
            ["Y delayed by 1", []]
        ]);
        return new imports.Packer({ shape });
    },

    updateShared(_imports, shared, newShared) {
        shared.m = newShared.m;
        shared.x = newShared.x;
        shared.c = newShared.c;
        shared.y = newShared.y;
        shared.yDelay1 = newShared.yDelay1;
    }
};
