import { Random } from "@reside-ic/random";
import { Packer } from "../Packer.ts";
import { ZeroEvery } from "../zero.ts";

/**
 * Interface defining the functionality of a discrete time model, which can be used by {@link DiscreteSystem}
 * to initialise and update particles. Generators are stateless and are always provided with all state and other
 * parameters required to update the particle in each method.
 *
 * @typeParam TShared Values which are shared between all particles in a group and are not mutated by them -
 * the model parameter values for that group
 *
 * @typeParam TInternal Internal state values which can be mutated by generators, used to improve efficiency of the
 * system by e.g. caching calculation results for use by other particles.
 */
export interface DiscreteGenerator<TShared, TInternal> {
    /**
     * Sets the initial state of a particle.
     *
     * @param time The current time at which to initialise particle state
     * @param shared The shared parameter values used by the particle's group
     * @param internal The internal state used by the particle's group
     * @param stateNext The array of values which should be updated by the generator with initial particle state values
     * @param random A random number generator which may be used by the generator to initialise values
     */
    initial(time: number, shared: TShared, internal: TInternal, stateNext: number[], random: Random): void;

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

    /**
     * Generates initial internal state for a given shared state
     * @param shared The shared state to generate initial internal state for
     */
    internal(shared: TShared): TInternal;

    /**
     * Gets a {@link Packer} which can pack shared state values into a one dimensional array
     * @param shared The shared state which the result should pack
     */
    packingState(shared: TShared): Packer;

    /**
     * Updates values in a system parameter set from a new parameter set. A generator may
     * do custom updating of some values.
     * @param shared The shared parameter set to update
     * @param newShared The parameter set to update from
     */
    updateShared(shared: TShared, newShared: TShared): void;

    /**
     * Gets a {@link ZeroEvery} vector used to reset certain indices of state to 0 at a
     * given frequency
     * @param shared The shared parameter set to update
     */
    zeroEvery?(shared: TShared): ZeroEvery;
}
