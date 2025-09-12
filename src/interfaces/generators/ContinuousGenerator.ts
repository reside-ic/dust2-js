import { BaseGenerator } from "./BaseGenerator.ts";

/**
 * Interpolated solution to the system of differential equations
 *
 *  @param t The time to look up the solution at
 */
export type Solution = (t: number) => number[];

/**
 * Interpolated solution to the system of differential equations over
 * a set of times (vs a single time in {@link Solution})
 *
 * @param t Array of times to look up the solution at
 */
export type FullSolution = (t: number[]) => number[][];

/**
 * This interface defines the functionality of a continuous time model without delays, which can be
 * used by ContinuousSystem to initialise and update particles.
 *
 * @copyDoc BaseGenerator
 */
export interface ContinuousGeneratorODE<TShared, TInternal> extends BaseGenerator<TShared, TInternal> {
    /**
     * Compute the derivatives
     *
     * @param t The time to compute initial conditions at
     *
     * @param y The value of the variables
     *
     * @param dydt An array *that will be written into*, will hold
     * derivatives on exit. Must be the same length as `y`
     */
    rhs(t: number, y: number[], dydt: number[]): void;

    /**
     * Compute additional quantities that are derived from the
     * variables. Unlike {@link ContinuousGeneratorODE.rhs | rhs}, this returns a vector rather
     * than writing in place. Not all models include an `output`
     * method - these models have no output.
     *
     * @copyDoc ContinuousGeneratorODE.rhs
     */
    output?(t: number, y: number[]): number[];
}

/**
 * This interface defines the functionality of a continuous time model with delays, which can be
 * used by ContinuousSystem to initialise and update particles.
 *
 * @copyDoc BaseGenerator
 */
export interface ContinuousGeneratorDDE<TShared, TInternal> extends BaseGenerator<TShared, TInternal> {
    /**
     * @copyDoc ContinuousGeneratorODE.rhs
     *
     * @param solution The interpolated solution, which is used to
     * compute delayed versions of variables
     */
    rhs(t: number, y: number[], dydt: number[], solution: Solution): void;

    /**
     * @copyDoc ContinuousGeneratorODE.output
     * @copyDoc ContinuousGeneratorDDE.rhs
     */
    output?(t: number, y: number[], solution: Solution): number[];
}
