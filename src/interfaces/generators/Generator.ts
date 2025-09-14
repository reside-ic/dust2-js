import { ContinuousGeneratorDDE, ContinuousGeneratorODE } from "./ContinuousGenerator";
import { DiscreteGenerator } from "./DiscreteGenerator";

export type Generator<TShared, TInternal, TData = null> =
    | DiscreteGenerator<TShared, TInternal, TData>
    | ContinuousGeneratorODE<TShared, TInternal, TData>
    | ContinuousGeneratorDDE<TShared, TInternal, TData>;

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

// get generator with some metadata about it
export function getGeneratorCfg<TShared, TInternal, TData>(
    generator: Generator<TShared, TInternal, TData>
): GeneratorConfig<TShared, TInternal, TData> {
    if (!("rhs" in generator)) {
        return {
            generator,
            isContinuous: false,
            hasDelays: false
        };
    } else if (generator.rhs.length === 3) {
        return {
            // typescript cannot infer type from length of function args so
            // as any is necessary here
            //
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            generator: generator as any,
            isContinuous: true,
            hasDelays: false
        };
    } else if (generator.rhs.length === 4) {
        return {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            generator: generator as any,
            isContinuous: true,
            hasDelays: true
        };
    } else {
        throw new TypeError("Unknown generator type");
    }
}
