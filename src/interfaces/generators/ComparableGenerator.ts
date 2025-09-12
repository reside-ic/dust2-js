import { Random } from "@reside-ic/random";
import { Generator } from "./Generator.ts";

/**
 * Interface which extends generator by adding functionality to compare particle state with observed
 * data.
 *
 * @copyDoc BaseGenerator
 * @typeParam TData Type of each data point which will be compared with system state.
 */
export type ComparableGenerator<TShared, TInternal, TData> = Generator<TShared, TInternal> & {
    /**
     * Compares the state of a particle with a data point, and returns the log likelihood of the state given the data.
     *
     * @param time The new time to which the particle state should be updated.
     * @param state The current state of the particle
     * @param shared The shared parameter values used by the particle's group
     * @param internal The internal state used by the particle's group
     * @param random A random number generator which may be used by the generator to update values
     * @param data The data point
     */
    compareData(
        time: number,
        state: number[],
        data: TData,
        shared: TShared,
        internal: TInternal,
        random: Random
    ): number;
};
