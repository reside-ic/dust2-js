import { DiscreteGenerator } from "../../src/interfaces/DiscreteGenerator"
import { Packer } from "../../src/Packer";
import { ZeroEvery } from "../../src/zero";

export interface ABState {
  a: number,
  b: number
}

export const zeroTwice: DiscreteGenerator<ABState, null> = {
  initial(_time, _shared, _internal, stateNext, _random) {
    stateNext[0] = 0;
    stateNext[1] = 0;
  }, 

  update(_time, _dt, state, _shared, _internal, stateNext, _random) {
    stateNext[0] = state[0] + 1;
    stateNext[1] = state[1] + 1;
  },

  packingState() {
    const shape = new Map<string, number[]>([
      ["x", []],
      ["y", []]
    ]);
    return new Packer({ shape });
  },

  zeroEvery(shared) {
    return [[shared.a, [0]], [shared.b, [1]]];
  },

  internal() {
     return null;
  },

  updateShared() {},
};
