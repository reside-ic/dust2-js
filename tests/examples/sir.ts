import { DiscreteSystemGenerator } from "../../src/generator.ts";

export interface Shared { // we might make this private later
    N: number;
    I0: number;
    beta: number;
    gamma: number;
}

export class DiscreteSIR implements DiscreteSystemGenerator {
    initial(time: number, shared: Shared, internal: null, stateNext: number[]) {
        stateNext[0] = shared.N - shared.I0;
        stateNext[1] = shared.I0;
        stateNext[2] = 0;
        stateNext[3] = 0;
        stateNext[4] = 0;
    }

    update(time: number, dt: number, state: number[], shared: Shared, internal: null, stateNext: number[]) {
        const S = state[0];
        const I = state[1];
        const R = state[2];
        const cases_cumul = state[3];
        const cases_inc = state[4];
        const p_SI = 1 - Math.exp(-shared.beta * I / shared.N * dt);
        const p_IR = 1 - Math.exp(-shared.gamma * dt);
        // const n_SI = monty::random::binomial<real_type>(rng_state, S, p_SI);
        // const n_IR = monty::random::binomial<real_type>(rng_state, I, p_IR);
        const n_SI = S * p_SI;
        const n_IR = I * p_IR;
        stateNext[0] = S - n_SI;
        stateNext[1] = I + n_SI - n_IR;
        stateNext[2] = R + n_IR;
        stateNext[3] = cases_cumul + n_SI;
        stateNext[4] = cases_inc + n_SI;
    }
}
