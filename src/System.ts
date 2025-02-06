import { SystemState } from "./SystemState";

export interface System {
    setStateInitial: () => void;
    setTime: (time: number) => void;
    state: Readonly<SystemState>;
    runToTime: (time: number) => void;
}
