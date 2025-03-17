import { System } from "./System";
import { NdArray } from "ndarray";

/**
 * Interface which extends {@link System} by adding functionality to compare system state with observed data.
 *
 * @typeParam TData Type of each data point which will be compared with system state.
 */
export interface ComparableSystem<TData> extends System {
    /**
     * Compares the state of all particles in the syatem with observed data, and returns an
     * {@link https://github.com/scijs/ndarray |NdArray } of log likelihoods
     * of each particle state given the data, where the NdArray has shape [nGroups, nParticles]
     * @param data Observed data to compare against system state
     */
    compareData(data: TData | TData[]): NdArray;
}
