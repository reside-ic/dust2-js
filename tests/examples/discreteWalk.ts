import type { Random } from "@reside-ic/random";
import type { DiscreteGenerator } from "../../src/interfaces/generators/DiscreteGenerator.ts";

export interface WalkShared {
    n: number;
    sd: number;
}

const checkStateRange = (state: number[], shared: WalkShared) => {
    if (state.length < shared.n) {
        throw RangeError(`State must have length of at least ${shared.n}`);
    }
};

export const discreteWalk: DiscreteGenerator<WalkShared, null, null> = {
    initial(_imports, time: number, shared: WalkShared, internal: null, stateNext: number[]) {
        checkStateRange(stateNext, shared);
        for (let i = 0; i < shared.n; i++) {
            stateNext[i] = time;
        }
    },

    update(
        _imports,
        time: number,
        dt: number,
        state: number[],
        shared: WalkShared,
        internal: null,
        stateNext: number[],
        random: Random
    ) {
        checkStateRange(state, shared);
        checkStateRange(stateNext, shared);
        for (let i = 0; i < shared.n; i++) {
            stateNext[i] = random.normal(state[i], shared.sd);
        }
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    internal(_imports, shared: WalkShared): null {
        return null;
    },

    packingState(imports, shared: WalkShared) {
        const shape = new Map<string, number[]>([["values", [shared.n]]]);
        return new imports.Packer({ shape });
    },

    updateShared(_imports, shared: WalkShared, newShared: WalkShared) {
        shared.n = newShared.n;
        shared.sd = newShared.sd;
    }
};
