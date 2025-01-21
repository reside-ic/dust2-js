export interface DiscreteSystemGenerator<TShared, TInternal> {
    initial: (time: number, shared: TShared, internal: TInternal,
              stateNext: number[]) => void,
    update: (time: number, dt: number, state: number[], shared: TShared,
             internal: TInternal, stateNext: number[]) => void
}
