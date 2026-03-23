import { Generator } from "../../src/interfaces/generators/Generator";
import { Packer } from "../../src/Packer";

export interface ABState {
    a: number;
    b: number;
}

export const zeroTwice: Generator<ABState, null> = {
    initial(_time, _shared, _internal, stateNext) {
        stateNext[0] = 0;
        stateNext[1] = 0;
    },

    update(_time, _dt, state, _shared, _internal, stateNext) {
        stateNext[0] = state[0] + 1;
        stateNext[1] = state[1] + 1;
    },

    packingState() {
        const shape = new Map<string, number[]>([
            ["x", []],
            ["y", []]
        ]);
        return new Packer({ shape });
    },

    getZeroEvery(shared) {
        return [
            [shared.a, [0]],
            [shared.b, [1]]
        ];
    },

    internal() {
        return null;
    },

    updateShared() {}
};
