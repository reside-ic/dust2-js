import type { ContinuousGeneratorODE } from "../../src/interfaces/generators/ContinuousGenerator.ts";

export interface ConstantGradNoUpdateShared {
    y: number;
    yAddOne: number;
}

export const constantGradNoUpdate: ContinuousGeneratorODE<ConstantGradNoUpdateShared, null, null> = {
    initial(_imports, time: number, shared, internal: null, stateNext: number[]) {
        stateNext[0] = shared.y;
        stateNext[1] = shared.yAddOne;
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

    packingState(imports) {
        const shape = new Map<string, number[]>([
            ["Y", []],
            ["Y + 1", []]
        ]);
        return new imports.Packer({ shape });
    },

    updateShared(_imports, shared, newShared) {
        shared.y = newShared.y;
        shared.yAddOne = newShared.yAddOne;
    }
};
