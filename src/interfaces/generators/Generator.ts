import { ContinuousGeneratorDDE, ContinuousGeneratorODE } from "./ContinuousGenerator";
import { DiscreteGenerator } from "./DiscreteGenerator";

export type Generator<TShared, TInternal> =
    | DiscreteGenerator<TShared, TInternal>
    | ContinuousGeneratorODE<TShared, TInternal>
    | ContinuousGeneratorDDE<TShared, TInternal>;

export type GeneratorConfig<TShared, TInternal> =
    | {
          generator: DiscreteGenerator<TShared, TInternal>;
          isContinuous: false;
          hasDelays: false;
      }
    | {
          generator: ContinuousGeneratorODE<TShared, TInternal>;
          isContinuous: true;
          hasDelays: false;
      }
    | {
          generator: ContinuousGeneratorDDE<TShared, TInternal>;
          isContinuous: true;
          hasDelays: true;
      };

export function getGeneratorCfg<TShared, TInternal>(
    generator: Generator<TShared, TInternal>
): GeneratorConfig<TShared, TInternal> {
    if (!("rhs" in generator)) {
        return {
            generator,
            isContinuous: false,
            hasDelays: false
        };
    } else if (generator.rhs.length === 3) {
        return {
            generator: generator as ContinuousGeneratorODE<TShared, TInternal>,
            isContinuous: true,
            hasDelays: false
        };
    } else if (generator.rhs.length === 4) {
        return {
            generator: generator,
            isContinuous: true,
            hasDelays: true
        };
    } else {
        throw TypeError("Unknown generator type");
    }
}
