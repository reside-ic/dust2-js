import { DiscreteSystemGenerator } from "../../src/generator.ts";

interface Shared {
    N: number;
    I0: number;
    beta: number;
    gamma: number;
}

export class DiscreteSIR implements DiscreteSystemGenerator<Shared, null> {
    // it would be more js-ish if we returned an array, but that would
    // be harder once we work out how to get read-write slices from
    // ndarray.
    initial(time: number, shared: Shared, internal: null, stateNext: number[]) {
        stateNext[0] = shared.N - shared.I0;
        stateNext[1] = shared.I0;
        stateNext[2] = 0;
        stateNext[3] = 0;
        stateNext[4] = 0;
    }

    update(time: number, dt: number, state: number[], shared: Shared,
           internal: null, stateNext: number[]) {
        const S = state[0];
        const I = state[1];
        const R = state[2];
        const casesCumul = state[3];
        const casesInc = state[4];
        const pSI = 1 - Math.exp(-shared.beta * I / shared.N * dt);
        const pIR = 1 - Math.exp(-shared.gamma * dt);
        // const nSI = monty::random::binomial<realtype>(rngstate, S, pSI);
        // const nIR = monty::random::binomial<realtype>(rngstate, I, pIR);
        const nSI = S * pSI;
        const nIR = I * pIR;
        stateNext[0] = S - nSI;
        stateNext[1] = I + nSI - nIR;
        stateNext[2] = R + nIR;
        stateNext[3] = casesCumul + nSI;
        stateNext[4] = casesInc + nSI;
    }

    internal(shared: TShared): TInternal {
        return null;
    }

    packingState(shared: TShared): Packer {
        return Packer({shape: {S: [], I: [], R: [], casesCumul: [], casesInc: []}});
    }
}
