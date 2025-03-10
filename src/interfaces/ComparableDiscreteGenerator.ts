import { DiscreteGenerator } from "./DiscreteGenerator.ts";
import { Random } from "@reside-ic/random";

export interface ComparableDiscreteGenerator<TShared, TInternal, TData> extends DiscreteGenerator<TShared, TInternal> {
    compareData(
        time: number,
        state: number[],
        data: TData,
        shared: TShared,
        internal: TInternal,
        random: Random
    ): number;
}
