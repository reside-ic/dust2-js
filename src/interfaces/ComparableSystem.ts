import { SystemDataComparison } from "../SystemDataComparison";
import { System } from "./System";

export interface ComparableSystem<TData> extends System {
    compareData: (data: TData | TData[]) => SystemDataComparison;
}
