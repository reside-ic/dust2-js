import { SystemState } from "./SystemState";
import { SystemDataComparison } from "./SystemDataComparison.ts";

export interface System<TData> {
    time: number;
    state: Readonly<SystemState>;
    setStateInitial: () => void;
    runToTime: (time: number) => void;
    compareData: (data: TData | TData[]) => SystemDataComparison;
}
