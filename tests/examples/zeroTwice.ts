import type { DiscreteGenerator } from "../../src/interfaces/generators/DiscreteGenerator";

export interface ABState {
    a: number;
    b: number;
}

export const zeroTwice: DiscreteGenerator<ABState, null, null> = {
    initial(_imports, _time, _params, _internal, stateNext) {
        stateNext[0] = 0;
        stateNext[1] = 0;
    },

    update(_imports, _time, _dt, state, _params, _internal, stateNext) {
        stateNext[0] = state[0] + 1;
        stateNext[1] = state[1] + 1;
    },

    packingState(imports) {
        const shape = new Map<string, number[]>([
            ["x", []],
            ["y", []]
        ]);
        return new imports.Packer({ shape });
    },

    getZeroEvery(_imports, params) {
        return [
            [params.a, [0]],
            [params.b, [1]]
        ];
    },

    internal() {
        return null;
    },

    updateParams() {}
};
