import { SystemState } from "../SystemState.ts";

/*
* Interface defining the basic functionality of a dust system
* */
export interface System {
    time: number;
    state: Readonly<SystemState>;
    setStateInitial: () => void;
    runToTime: (time: number) => void;
}
