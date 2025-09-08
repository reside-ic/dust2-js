import { BaseGenerator } from "./BaseGenerator.ts";

/**
 * Interface defining the functionality of a discrete time model, which can be used by {@link DiscreteSystem}
 * to initialise and update particles.
 *
 * @copyDoc BaseGenerator
 */
export interface DiscreteGenerator<TShared, TInternal> extends BaseGenerator<TShared, TInternal> {};
