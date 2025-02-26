import { DiscreteSystemGenerator } from "../../src/DiscreteSystemGenerator.ts";
import { Random } from "@reside-ic/random";
import { Packer } from "../../src/Packer.ts";

export interface WalkShared {
    n: number;
    sd: number;
}

export const discreteWalk: DiscreteSystemGenerator<WalkShared, null> = {
    initial(time: number, shared: WalkShared, internal: null, stateNext: number[]) {
        // TODO: thrwo error if stateNExt is too short
        for (let i = 0; i < shared.n; i++) {
            stateNext[i] = time;
        }
    },

    update(time: number, dt: number, state: number[], shared: WalkShared, internal: null, stateNext: number[], random: Random) {
        // TODO: thrwo error if state or stateNExt is too short
        for (let i = 0; i < shared.n; i++) {
            stateNext[i] = random.normal(state[i], shared.sd);
        }
    },

    internal(shared: WalkShared): null {
        return null;
    },

    packingState(shared: WalkShared): Packer {
        const shape = new Map<string, number[]>([
            ["values", [shared.n]]
        ]);
        return new Packer({ shape });
    }
}