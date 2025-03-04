import { SystemState } from "../SystemState.ts";

export interface System {
    time: number;
    state: Readonly<SystemState>;
    setStateInitial: () => void;
    runToTime: (time: number) => void;
}
