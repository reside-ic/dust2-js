import { DiscreteGenerator } from "./DiscreteGenerator.ts";
import { Random } from "@reside-ic/random";

/**
 * Interface which extends {@link DiscreteGenerator} by adding functionality to compare particle state with observed
 * data.
 *
 * @typeParam TShared Values which are shared between all particles in a group and are not mutated by them -
 * the model parameter values for that group
 *
 * @typeParam TInternal Internal state values which can be mutated by generators, used to improve efficiency of the
 * system by e.g. caching calculation results for use by other particles.
 *
 * @typeParam TData Type of each data point which will be compared with system state.
 */
export interface ComparableDiscreteGenerator<TShared, TInternal, TData> extends DiscreteGenerator<TShared, TInternal> {
    /**
     * Compares the state of a particle with a data point, and returns the log likelihood of the state given the data.
     * @param time The system time for which the data point applies
     * @param state The particle state to compare to the data
     * @param data The data point
     * @param shared The shared parameter values used by the particle's group
     * @param internal The internal state used by the particle's group
     * @param random A random number generator which may be used by the generator to compare values
     */
    compareData(
        time: number,
        state: number[],
        data: TData,
        shared: TShared,
        internal: TInternal,
        random: Random
    ): number;
}
