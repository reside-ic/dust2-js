import { DiscreteGenerator } from "../../src/interfaces/generators/DiscreteGenerator.ts";
import { Random } from "@reside-ic/random";
import { Packer } from "../../src/Packer.ts";

export interface WalkShared {
    n: number;
    sd: number;
}

const checkStateRange = (state: number[], shared: WalkShared) => {
    if (state.length < shared.n) {
        throw RangeError(`State must have length of at least ${shared.n}`);
    }
};

export const discreteWalk: DiscreteGenerator<WalkShared, null> = {
    initial(time: number, shared: WalkShared, internal: null, stateNext: number[]) {
        checkStateRange(stateNext, shared);
        for (let i = 0; i < shared.n; i++) {
            stateNext[i] = time;
        }
    },

    update(
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
    internal(shared: WalkShared): null {
        return null;
    },

    packingState(shared: WalkShared): Packer {
        const shape = new Map<string, number[]>([["values", [shared.n]]]);
        return new Packer({ shape });
    },

    updateShared(shared: WalkShared, newShared: WalkShared) {
        shared.n = newShared.n;
        shared.sd = newShared.sd;
    }
};
