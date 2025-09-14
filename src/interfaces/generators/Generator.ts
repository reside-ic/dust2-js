import { ComparableGeneratorExtension } from "./ComparableGeneratorExtension";
import { ContinuousGeneratorDDE, ContinuousGeneratorODE } from "./ContinuousGenerator";
import { DiscreteGenerator } from "./DiscreteGenerator";

// generators without compareData
export type NonComparableGenerator<TShared, TInternal> =
    | DiscreteGenerator<TShared, TInternal>
    | ContinuousGeneratorODE<TShared, TInternal>
    | ContinuousGeneratorDDE<TShared, TInternal>;

// add compareData if TData is not null
export type Generator<TShared, TInternal, TData = null> = TData extends null
    ? NonComparableGenerator<TShared, TInternal>
    : NonComparableGenerator<TShared, TInternal> & ComparableGeneratorExtension<TShared, TInternal, TData>;

// utility to add compareData function to generator if TData is not null, used below
export type MakeComparableIfTData<Gen, TShared, TInternal, TData> = TData extends null
    ? Gen
    : Gen & ComparableGeneratorExtension<TShared, TInternal, TData>;

// discriminated union so type system can work out what type of generator we are using
export type NotComparableGeneratorConfig<TShared, TInternal> =
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

// add compareData to generator field if TData is not null
export type GeneratorConfig<TShared, TInternal, TData, GenCfg = NotComparableGeneratorConfig<TShared, TInternal>> = {
    [K in keyof GenCfg]: K extends "generator"
        ? MakeComparableIfTData<GenCfg[K], TShared, TInternal, TData>
        : GenCfg[K];
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
