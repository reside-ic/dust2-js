import { Random } from "@reside-ic/random";
import { BaseGenerator } from "./BaseGenerator.ts";

/**
 * Interface defining the functionality of a discrete time model, which can be used by {@link System}
 * to initialise and update particles.
 *
 * @copyDoc BaseGenerator
 */
export interface DiscreteGenerator<TShared, TInternal, TData> extends BaseGenerator<TShared, TInternal, TData> {
    /**
     * Updates the state of a particle from its previous state.
     *
     * @param time The new time to which the particle state should be updated.
     * @param dt The time step from the current time to the new time
     * @param state The current state of the particle
     * @param shared The shared parameter values used by the particle's group
     * @param internal The internal state used by the particle's group
     * @param stateNext The array of values which should be updated by the generator with new particle state values
     * @param random A random number generator which may be used by the generator to update values
     */
    update(
        time: number,
        dt: number,
        state: number[],
        shared: TShared,
        internal: TInternal,
        stateNext: number[],
        random: Random
    ): void;
}
