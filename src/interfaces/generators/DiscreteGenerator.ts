import { BaseGenerator } from "./BaseGenerator";

/**
 * Extends {@link BaseGenerator}. This defines the functionality of a discrete time model, which can
 * be used by {@link DiscreteSystem} to initialise and update particles.
 */
export type DiscreteGenerator<TShared, TInternal> = BaseGenerator<TShared, TInternal>;
