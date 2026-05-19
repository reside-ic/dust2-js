import { Random } from "@reside-ic/random";
import { BaseGenerator } from "./BaseGenerator.ts";
import { Imports } from "./Imports.ts";

/**
 * Interface defining the functionality of a discrete time model, which can be used by {@link System}
 * to initialise and update particles.
 *
 * @copyDoc BaseGenerator
 */
export interface DiscreteGenerator<TParams, TInternal, TData> extends BaseGenerator<TParams, TInternal, TData> {
    /**
     * Updates the state of a particle from its previous state.
     *
     * @param imports Object containing useful classes/utilities from this package the class may need
     * @param time The new time to which the particle state should be updated.
     * @param dt The time step from the current time to the new time
     * @param state The current state of the particle
     * @param params The parameter values used by the particle
     * @param internal The internal state used by the particle
     * @param stateNext The array of values which should be updated by the generator with new particle state values
     * @param random A random number generator which may be used by the generator to update values
     */
    update(
        imports: Imports,
        time: number,
        dt: number,
        state: number[],
        params: TParams,
        internal: TInternal,
        stateNext: number[],
        random: Random
    ): void;
}
