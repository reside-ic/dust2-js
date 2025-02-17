import { SystemState } from "./SystemState";

export interface System {
    time: number;
    state: Readonly<SystemState>;
    setStateInitial: () => void;
    runToTime: (time: number) => void;
}
