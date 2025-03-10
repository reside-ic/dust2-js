import { System } from "./System";
import { NdArray } from "ndarray";

/*
* Interface which extends [[System]] by adding functionality to compare system state with observed data.
 */
export interface ComparableSystem<TData> extends System {
    compareData: (data: TData | TData[]) => NdArray;
}
