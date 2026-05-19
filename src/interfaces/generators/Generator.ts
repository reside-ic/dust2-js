import { ContinuousGeneratorDDE, ContinuousGeneratorODE } from "./ContinuousGenerator";
import { DiscreteGenerator } from "./DiscreteGenerator";

// discriminated union so type system can work out what type of generator we are using
export type GeneratorConfig<TParams, TInternal, TData> =
    | {
          generator: DiscreteGenerator<TParams, TInternal, TData>;
          isContinuous: false;
          hasDelays: false;
      }
    | {
          generator: ContinuousGeneratorODE<TParams, TInternal, TData>;
          isContinuous: true;
          hasDelays: false;
      }
    | {
          generator: ContinuousGeneratorDDE<TParams, TInternal, TData>;
          isContinuous: true;
          hasDelays: true;
      };
