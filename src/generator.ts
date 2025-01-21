export interface DiscreteSystemGenerator {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    initial: (time: number, shared: any, internal: any, stateNext: number[]) =>
        void,
    update: (time: number, dt: number, state: number[], shared: any,
             internal: any, stateNext: number[]) => void,
};
