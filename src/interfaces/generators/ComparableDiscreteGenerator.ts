import { DiscreteGenerator } from "./DiscreteGenerator.ts";
import { Random } from "@reside-ic/random";

/**
 * Interface which extends {@link DiscreteGenerator} by adding functionality to compare particle state with observed
 * data.
 *
 * @copyDoc BaseGenerator
 * @typeParam TData Type of each data point which will be compared with system state.
 */
export interface ComparableDiscreteGenerator<TShared, TInternal, TData> extends DiscreteGenerator<TShared, TInternal> {
    /**
     * Compares the state of a particle with a data point, and returns the log likelihood of the state given the data.
     *
     * @copyDoc BaseGenerator.update
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
}
