import { SystemState } from "../SystemState.ts";

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
     * Runs the system from its current time to the given time, causing its state to be updated
     * @param time The time to run to
     */
    runToTime(time: number): void;
}
