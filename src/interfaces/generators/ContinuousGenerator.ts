import { BaseGenerator } from "./BaseGenerator.ts";

/** Interpolated solution to the system of differential equations
 *
 *  @param t The time to look up the solution at
 */
export type Solution = (t: number) => number[];

/** Interpolated solution to the system of differential equations over
 * a set of times (vs a single time in {@link Solution})
 *
 *  @param t The time to look up the solution at
 */
export type FullSolution = (t: number[]) => number[][];

/**
 * Extends {@link BaseGenerator}. This interface defines the functionality of a continuous time model
 * without delays, which can be used by {@link ContinuousSystem} to initialise and update particles.
 */
export interface ContinuousGeneratorODE<TShared, TInternal> extends BaseGenerator<TShared, TInternal> {
    /** Compute the derivatives
     *
     * @param t The time to compute initial conditions at
     *
     * @param y The value of the variables
     *
     * @param dydt An array *that will be written into*, will hold
     * derivatives on exit. Must be the same length as `y`
     */
    rhs(t: number, y: number[], dydt: number[]): void;

    /** Compute additional quantities that are derived from the
     * variables.  Unlike {@link rhs}, this returns a vector rather
     * than writing in place. Not all models include an `output`
     * method - these models have no output.
     *
     * @param t The time to compute output at
     *
     * @param y The value of the variables
     */
    output?(t: number, y: number[]): number[];
};

/**
 * Extends {@link BaseGenerator}. This interface defines the functionality of a continuous time model
 * with delays, which can be used by {@link ContinuousSystem} to initialise and update particles.
 */
export interface ContinuousGeneratorDDE<TShared, TInternal> extends BaseGenerator<TShared, TInternal> {
    /** Compute the derivatives
     *
     * @param t The time to compute initial conditions at
     *
     * @param y The value of the variables
     *
     * @param dydt An array *that will be written into*, will hold
     * derivatives on exit. Must be the same length as `y`
     *
     * @param solution The interpolated solution, which is used to
     * compute delayed versions of variables
     */
    rhs(t: number, y: number[], dydt: number[], solution: Solution): void;

    /** Compute additional quantities that are derived from the
     * variables.  Unlike {@link rhs}, this returns a vector rather
     * than writing in place. Not all models include an `output`
     * method - these models have no output.
     *
     * @param t The time to compute output at
     *
     * @param y The value of the variables
     *
     * @param solution The interpolated solution, which is used to
     * compute delayed versions of variables
     */
    output?(t: number, y: number[], solution: Solution): number[];
};
