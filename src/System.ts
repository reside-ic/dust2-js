import { SystemState } from "./SystemState";

export interface System {
    setStateInitial: () => void;
    setTime: (time: number) => void;
    getState: () => SystemState;
    runToTime: (time: number) => void;
}