import { ContinuousGeneratorDDE, ContinuousGeneratorODE } from "./ContinuousGenerator";
import { DiscreteGenerator } from "./DiscreteGenerator";

// discriminated union so type system can work out what type of generator we are using
export type GeneratorConfig<TShared, TInternal, TData> =
    | {
          generator: DiscreteGenerator<TShared, TInternal, TData>;
          isContinuous: false;
          hasDelays: false;
      }
    | {
          generator: ContinuousGeneratorODE<TShared, TInternal, TData>;
          isContinuous: true;
          hasDelays: false;
      }
    | {
          generator: ContinuousGeneratorDDE<TShared, TInternal, TData>;
          isContinuous: true;
          hasDelays: true;
      };
