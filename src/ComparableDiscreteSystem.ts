import ndarray from "ndarray";
import { DiscreteSystem } from "./DiscreteSystem.ts";
import { ComparableSystem } from "./interfaces/systems/ComparableSystem.ts";
import { particleStateToArray } from "./utils.ts";
import { Random } from "@reside-ic/random";
import { ComparableDiscreteGenerator } from "./interfaces/generators/ComparableDiscreteGenerator.ts";

/**
 * Implementation of {@link ComparableSystem} for discrete systems, for use with generators which support comparison
 * to data.
 *
 * @copyDoc ComparableDiscreteGenerator
 */
export class ComparableDiscreteSystem<TShared, TInternal, TData>
    extends DiscreteSystem<TShared, TInternal>
    implements ComparableSystem<TData>
{
    declare protected _generator: ComparableDiscreteGenerator<TShared, TInternal, TData>;

    /**
     * @copyDoc DiscreteSystem.constructor
     */
    constructor(
        generator: ComparableDiscreteGenerator<TShared, TInternal, TData>,
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
