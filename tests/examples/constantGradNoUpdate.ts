import type { ContinuousGeneratorODE } from "../../src/interfaces/generators/ContinuousGenerator.ts";

export interface ConstantGradNoUpdateParams {
    y: number;
    yAddOne: number;
}

export const constantGradNoUpdate: ContinuousGeneratorODE<ConstantGradNoUpdateParams, null, null> = {
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

    internal(): null {
        return null;
    },

    buildParams(imports, params) {
        const shape = new Map<string, number[]>();
        shape.set("Y", []);
        shape.set("Y + 1", []);
        return { ...params, dim: { shape } };
    },

    updateParams(_imports, params, newParams) {
        params.y = newParams.y;
        params.yAddOne = newParams.yAddOne;
    }
};
