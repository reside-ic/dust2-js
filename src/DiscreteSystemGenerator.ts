import { Random } from "@reside-ic/random";
import { Packer } from "./Packer";

export interface DiscreteSystemGenerator<TShared, TInternal> {
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
}
