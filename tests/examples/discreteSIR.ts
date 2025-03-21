import { Packer } from "../../src/Packer";
import { Random } from "@reside-ic/random";
import { poissonLogDensity } from "../../src/density.ts";
import { ComparableDiscreteGenerator } from "../../src/interfaces/ComparableDiscreteGenerator.ts";

export interface SIRShared {
    N: number;
    I0: number;
    beta: number;
    gamma: number;
}

export interface SIRData {
    prevalence: number;
}

export const discreteSIR: ComparableDiscreteGenerator<SIRShared, null, SIRData> = {
    // it would be more js-ish if we returned an array, but that would
    // be harder once we work out how to get read-write slices from
    // ndarray.
    initial(time: number, shared: SIRShared, internal: null, stateNext: number[]) {
        stateNext[0] = shared.N - shared.I0;
        stateNext[1] = shared.I0;
        stateNext[2] = 0;
        stateNext[3] = 0;
        stateNext[4] = 0;
    },

    update(
        time: number,
        dt: number,
        state: number[],
        shared: SIRShared,
        internal: null,
        stateNext: number[],
        random: Random
    ) {
        const S = state[0];
        const I = state[1];
        const R = state[2];
        const cases_cumul = state[3];
        const cases_inc = state[4];
        const p_SI = 1 - Math.exp(((-shared.beta * I) / shared.N) * dt);
        const p_IR = 1 - Math.exp(-shared.gamma * dt);
        const n_SI = random.binomial(S, p_SI);
        const n_IR = random.binomial(I, p_IR);
        stateNext[0] = S - n_SI;
        stateNext[1] = I + n_SI - n_IR;
        stateNext[2] = R + n_IR;
        stateNext[3] = cases_cumul + n_SI;
        stateNext[4] = cases_inc + n_SI;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    internal(shared: SIRShared): null {
        return null;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    packingState(shared: SIRShared): Packer {
        const shape = new Map<string, number[]>([
            ["S", []],
            ["I", []],
            ["R", []],
            ["casesCumul", []],
            ["casesInc", []]
        ]);
        return new Packer({ shape });
    },

    compareData(
        time: number,
        state: number[],
        data: SIRData,
        shared: SIRShared, // eslint-disable-line @typescript-eslint/no-unused-vars
        internal: null, // eslint-disable-line @typescript-eslint/no-unused-vars
        random: Random // eslint-disable-line @typescript-eslint/no-unused-vars
    ): number {
        const observedPrevalence = data.prevalence;
        const modelledPrevalence = state[1];
        return poissonLogDensity(observedPrevalence, modelledPrevalence);
    },

    updateShared(shared: SIRShared, newShared: SIRShared) {
        // does not update N
        shared.I0 = newShared.I0;
        shared.beta = newShared.beta;
        shared.gamma = newShared.gamma;
    }
};
