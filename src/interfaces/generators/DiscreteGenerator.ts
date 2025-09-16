import { BaseGenerator } from "./BaseGenerator.ts";

/**
 * Interface defining the functionality of a discrete time model, which can be used by {@link System}
 * to initialise and update particles.
 *
 * @copyDoc BaseGenerator
 */
export interface DiscreteGenerator<TShared, TInternal, TData> extends BaseGenerator<TShared, TInternal, TData> {}
