import type { ContinuousGeneratorODE } from "../../src/interfaces/generators/ContinuousGenerator.ts";

export interface ConstantGradParams {
    y: number;
    yAddOne: number;
}

export const constantGrad: ContinuousGeneratorODE<ConstantGradParams, null, null> = {
    initial(_imports, time: number, params, internal: null, stateNext: number[]) {
        stateNext[0] = params.y;
        stateNext[1] = params.yAddOne;
    },

    rhs(_imports, t, y, dydt) {
        dydt[0] = 1;
    },

    output(_imports, t, y) {
        const output = Array(1);
        output[0] = y[0] + 1;
        return output;
    },

    update(_imports, time: number, dt: number, state: number[], params, internal: null, stateNext: number[]) {
        // tests end at time = 10
        if (time === 8) {
            stateNext[0] = 100;
        }
    },

    internal(): null {
        return null;
    },

    packingState(imports) {
        const shape = new Map<string, number[]>([
            ["Y", []],
            ["Y + 1", []]
        ]);
        return new imports.Packer({ shape });
    },

    updateParams(_imports, params, newParams) {
        params.y = newParams.y;
        params.yAddOne = newParams.yAddOne;
    }
};
