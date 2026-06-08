import { Random } from "@reside-ic/random";
import { Packer } from "../../Packer.ts";
import { ZeroEvery } from "../../zero.ts";
import { Imports } from "./Imports.ts";

/**
 * Interface defining the functionality of a general odin model. Generators are stateless and are always provided
 * with all state and other parameters required to update the particle in each method.
 *
 * @typeParam TParams Values which are shared between all particles are not mutated by them - i.e.
 * the model parameter values
 *
 * @typeParam TInternal Internal state values which can be mutated by generators, used to improve efficiency of the
 * system by e.g. caching calculation results for use by other particles.
 *
 * @typeParam TData Type of each data point which will be compared with system state.
 */
export interface BaseGenerator<TParams, TInternal, TData> {
    /**
     * Sets the initial state of a particle.
     *
     * @param imports Object containing useful classes/utilities from this package the class may need
     * @param time The current time at which to initialise particle state
     * @param params The parameter values used by the particle
     * @param internal The internal state used by the particle
     * @param stateNext The array of values which should be updated by the generator with initial particle state values
     * @param random A random number generator which may be used by the generator to initialise values
     */
    initial(
        imports: Imports,
        time: number,
        params: TParams,
        internal: TInternal,
        stateNext: number[],
        random: Random
    ): void;

    /**
     * Generates initial internal state for a given parameter state
     * @param imports Object containing useful classes/utilities from this package the class may need
     * @param params The shared parameter values used by the particle
     */
    internal(imports: Imports, params: TParams): TInternal;

    /**
     * Gets a {@link Packer} which can pack params state values into a one dimensional array
     * @param imports Object containing useful classes/utilities from this package the class may need
     * @param params The shared parameter values used by the particle
     */
    packingState(imports: Imports, params: TParams): Packer;

    /**
     * Updates values in a system parameter set from a new parameter set. A generator may
     * do custom updating of some values.
     * @param imports Object containing useful classes/utilities from this package the class may need
     * @param params The parameter set to update
     * @param newParams The parameter set to update from
     */
    updateParams(imports: Imports, params: TParams, newParams: TParams): void;

    /**
     * Gets a {@link ZeroEvery} vector used to reset certain indices of state to 0 at a
     * given frequency
     * @param imports Object containing useful classes/utilities from this package the class may need
     * @param params The parameter set to update
     */
    getZeroEvery?(imports: Imports, params: TParams): ZeroEvery;

    /**
     * Compares the state of a particle with a data point, and returns the log likelihood of the state given the data.
     *
     * @param imports Object containing useful classes/utilities from this package the class may need
     * @param time The new time to which the particle state should be updated.
     * @param state The current state of the particle
     * @param params The parameter values used by the particle
     * @param internal The internal state used by the particle
     * @param random A random number generator which may be used by the generator to update values
     * @param data The data point
     */
    compareData?(
        imports: Imports,
        time: number,
        state: number[],
        data: TData,
        params: TParams,
        internal: TInternal,
        random: Random
    ): number;
}
