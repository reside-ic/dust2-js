import { SystemState, SystemSubState } from "../SystemState.ts";
import { SystemSimulateResult } from "../SystemSimulateResult.ts";

/**
 * Interface defining the basic functionality of a dust system, composed of a number of particles
 * */
export interface System {
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
     * @param groupIndices The group indices, in order, which the first dimension of newState are setting values for.
     * If empty, this means newState provides values for all groups.
     * @param particleIndices The particle indices, in order, which the second dimension of newState are setting values
     * for. If empty, this means newState provides values for all particles.
     * @param stateElementIndices The state element indices, in order, which the second dimension of newState are
     * setting values for. If empty, this means newState provides values for all state elements.
     */
    setState(
        newState: SystemSubState,
        groupIndices: number[],
        particleIndices: number[],
        stateElementIndices: number[]
    ): void;

    /**
     * Runs the system from its current time to the given time, causing its state to be updated
     * @param time The time to run to
     */
    runToTime(time: number): void;

    simulate(times: number[], stateElementIndices: number[]): SystemSimulateResult;
}
