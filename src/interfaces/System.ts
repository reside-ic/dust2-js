import { NdArray } from "ndarray";
import { SystemState, SystemSubState } from "../SystemState.ts";
import { SystemSimulateResult } from "../SystemSimulateResult.ts";

type Value = (number[] | number)[]
export type NamedResult = { times: number[], values: Record<string, Value>[] }

/**
 * Interface defining the basic functionality of a dust system, composed of a number of particles
 * */
export interface SystemInterface<TData> {
    /**
     * The current time in the system
     */
    time: number;

    /**
     * The current state of each particle in the system
     */
    state: Readonly<SystemState>;

    /**
     * Sets or resets the system to its initial state for all particles.
     */
    setStateInitial(): void;

    /**
     * Sets new values in the system state
     * @param newState The new state values for all or part of the state. If partial state, the shape must match the
     * values provided in the indices parameters
     * @param particleIndices The particle indices, in order, which the second dimension of newState are setting values
     * for. If empty, this means newState provides values for all particles.
     * @param stateElementIndices The state element indices, in order, which the second dimension of newState are
     * setting values for. If empty, this means newState provides values for all state elements.
     */
    setState(newState: SystemSubState, particleIndices: number[], stateElementIndices: number[]): void;

    /**
     * Runs the system from its current time to the given time, causing its state to be updated
     * @param time The time to run to
     */
    runToTime(time: number): void;

    /**
     * Runs the system from its current time to a series of times given by the parameter times
     * and returns state values for all particles at each of these times.
     * @param times The times to run to and return state for. Must be in increasing order, with no value less than the
     * current time.
     * @param stateElementIndices Indices of the state elements to return in the result. If an empty array is provided,
     * all values are returned.
     */
    simulate(times: number[], stateElementIndices: number[]): SystemSimulateResult;

    /**
     * Runs the system from its current time to a series of times given by the parameter times
     * and returns state values for all particles at each of these times.
     * @param times The times to run to and return state for. Must be in increasing order, with no value less than the
     * current time.
     * @param stateElementNames String array of names of variables to return from the state elements. If no names are
     * provided then all state elements are returned.
     */
    simulateByStateVariableName(times: number[], stateElementNames: string[]): NamedResult;

    /**
     * Compares the state of all particles in the syatem with observed data, and returns an
     * {@link https://github.com/scijs/ndarray |NdArray } of log likelihoods
     * of each particle state given the data, where the NdArray has shape [nParticles]
     * @param data Observed data to compare against system state
     */
    compareData(data: TData | TData[]): NdArray;
}
