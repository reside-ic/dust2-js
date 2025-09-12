import ndarray from "ndarray";
import { ComparableSystemInterface } from "./interfaces/systems/ComparableSystem.ts";
import { particleStateToArray } from "./utils.ts";
import { Random } from "@reside-ic/random";
import { ComparableGenerator } from "./interfaces/generators/ComparableGenerator.ts";
import { System } from "./System.ts";

/**
 * Implementation of {@link ComparableSystemInterface} for any system, for use with generators which support comparison
 * to data.
 *
 * @copyDoc ComparableGenerator
 */
export class ComparableSystem<TShared, TInternal, TData>
    extends System<TShared, TInternal>
    implements ComparableSystemInterface<TData>
{
    declare protected _generator: ComparableGenerator<TShared, TInternal, TData>;

    /**
     * @copyDoc System.constructor
     */
    constructor(
        generator: ComparableGenerator<TShared, TInternal, TData>,
        shared: TShared[],
        time: number,
        dt: number,
        nParticles: number,
        random?: Random
    ) {
        super(generator, shared, time, dt, nParticles, random);
    }

    public compareData(data: TData[] | TData) {
        // are we sharing data between all groups
        const isSharedData = !Array.isArray(data) || data.length === 1;
        let sharedData: TData;
        if (isSharedData) {
            sharedData = Array.isArray(data) ? data[0] : data;
        } else {
            if (data.length !== this._nGroups) {
                throw new RangeError("Expected data to have same length as groups.");
            }
        }

        const result = ndarray(new Array(this._nGroups * this._nParticles), [this._nGroups, this._nParticles]);
        this.iterateParticles((iGroup: number, iParticle: number) => {
            const iData = isSharedData ? sharedData : data[iGroup];
            const state = this._state.getParticle(iGroup, iParticle);
            const shared = this._shared[iGroup];
            const internal = this._internal[iGroup];
            const comparisonValue = this._generator.compareData(
                this._time,
                particleStateToArray(state),
                iData,
                shared,
                internal,
                this._random
            );
            result.set(iGroup, iParticle, comparisonValue);
        });
        return result;
    }
}
