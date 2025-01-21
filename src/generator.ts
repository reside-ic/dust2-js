export interface DiscreteSystemGenerator {
    initial: (time: number, shared: any, internal: any, stateNext: number[]) => void,
    update: (time: number, dt: number, state: number[], shared: any, internal: any, stateNext: number[]) => void,
};
