import { Random } from "@reside-ic/random";
import { Packer } from "./Packer";

export interface DiscreteSystemGenerator<TShared, TInternal, TData> {
    initial: (time: number, shared: TShared, internal: TInternal, stateNext: number[], random: Random) => void;
    update: (
        time: number,
        dt: number,
        state: number[],
        shared: TShared,
        internal: TInternal,
        stateNext: number[],
        random: Random
    ) => void;
    internal: (shared: TShared) => TInternal;
    packingState: (shared: TShared) => Packer;
    compareData(
        time: number,
        state: number[],
        data: TData,
        shared: TShared,
        internal: null,
        random: Random
    ): number;
}
