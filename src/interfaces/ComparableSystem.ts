import { System } from "./System";
import { NdArray } from "ndarray";

export interface ComparableSystem<TData> extends System {
    compareData: (data: TData | TData[]) => NdArray;
}
