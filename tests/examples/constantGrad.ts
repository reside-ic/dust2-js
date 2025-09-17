import { ContinuousGeneratorODE } from "../../src/interfaces/generators/ContinuousGenerator.ts";
import { Packer } from "../../src/Packer.ts";

export interface ConstantGradShared {
    y: number;
    yAddOne: number;
}

export const constantGrad: ContinuousGeneratorODE<ConstantGradShared, null, null> = {
    initial(time: number, shared, internal: null, stateNext: number[]) {
        stateNext[0] = shared.y;
        stateNext[1] = shared.yAddOne;
    },

    rhs(t, y, dydt) {
        dydt[0] = 1;
    },

    output(t, y) {
        const output = Array(1);
        output[0] = y[0] + 1;
        return output;
    },

    update(time: number, dt: number, state: number[], shared, internal: null, stateNext: number[]) {
        // tests end at time = 10
        if (time === 8) {
            stateNext[0] = 100;
        }
    },

    internal(): null {
        return null;
    },

    packingState(): Packer {
        const shape = new Map<string, number[]>([
            ["Y", []],
            ["Y + 1", []]
        ]);
        return new Packer({ shape, nRhsVariables: 1 });
    },

    updateShared(shared, newShared) {
        shared.y = newShared.y;
        shared.yAddOne = newShared.yAddOne;
    }
};
