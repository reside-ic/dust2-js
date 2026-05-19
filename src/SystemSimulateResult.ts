import ndarray from "ndarray";
import { checkIntegerInRange } from "./utils.ts";
import { ArrayState, ParticleState } from "./SystemState.ts";

/**
 * Class which provides results of {@link SystemInterface#simulate | SystemInterface.simulate}, providing an underlying
 * {@link https://www.npmjs.com/package/ndarray | NdArray} as well as helper methods to
 * get state values by element index or time index.
 */
export class SystemSimulateResult {
    private readonly _nParticles: number;
    private readonly _nStateElements: number;
    private readonly _nTimes: number;
    private readonly _resultValues: ndarray.NdArray;

    /**
     *
     * @param nParticles The number of particles
     * @param nStateElements The number of state elements for which this object holds state values
     * @param nTimes The number of times for which this object holds state values
     */
    constructor(nParticles: number, nStateElements: number, nTimes: number) {
        checkIntegerInRange("Number of particles", nParticles, 1);
        checkIntegerInRange("Number of state elements", nStateElements, 1);
        checkIntegerInRange("Number of times", nTimes, 1);

        this._nParticles = nParticles;
        this._nStateElements = nStateElements;
        this._nTimes = nTimes;

        // arrange the ndArray with dimensions: group, particle, stateElement * time
        const len = this._nParticles * this._nStateElements * this._nTimes;
        this._resultValues = ndarray(new Array<number>(len).fill(0), [
            this._nParticles,
            this._nStateElements,
            this._nTimes
        ]);
    }

    /**
     * Provides the underlying {@link https://www.npmjs.com/package/ndarray | NdArray} holding all result values
     */
    public resultValues() {
        return this._resultValues;
    }

    /**
     * Returns all the result state values for a particle at a given time index. NB This returns a ParticleState
     * but may be a a partial array of all elements in the particle, depending on the elements requested in the
     * simulate call.
     *
     * @param iParticle Index of the particle
     * @param iTime Index of the time - NB not time value, but the index in the times parameter provided to
     * {@link SystemInterface#simulate | SystemInterface.simulate}
     */
    public getValuesForTime(iParticle: number, iTime: number): ParticleState {
        this.checkIndexes(iParticle, null, iTime);
        return this._resultValues.pick(iParticle, null, iTime);
    }

    /**
     * Sets result state values for a given particle at a given time.
     *
     * @copyDoc SystemSimulateResult.getValuesForTime
     * @param stateValues The state values to set, for all values requested in the stateElementIndices parameter
     * provided to {@link SystemInterface#simulate  | SystemInterface.simulate}
     */
    public setValuesForTime(iParticle: number, iTime: number, stateValues: number[]) {
        this.checkIndexes(iParticle, null, iTime);
        if (stateValues.length !== this._nStateElements) {
            throw RangeError(`Expected ${this._nStateElements} state values but got ${stateValues.length}.`);
        }
        for (let i = 0; i < stateValues.length; i++) {
            this._resultValues.set(iParticle, i, iTime, stateValues[i]);
        }
    }

    /**
     * Returns values at all time indexes, for a given state element index.
     *
     * @copyDoc SystemSimulateResult.getValuesForTime
     * @param iStateElement Index of the state element - NB not the element index within the entire System state, but
     * the index in the stateElementIndices parameter provided to
     * {@link SystemInterface#simulate | SystemInterface.simulate}
     */
    public getStateElement(iParticle: number, iStateElement: number): ArrayState {
        this.checkIndexes(iParticle, iStateElement, null);
        return this._resultValues.pick(iParticle, iStateElement, null);
    }

    private checkIndexes(iParticle: number, iStateElement: number | null, iTime: number | null) {
        checkIntegerInRange("Particle index", iParticle, 0, this._nParticles - 1);
        if (iStateElement !== null) {
            checkIntegerInRange("State Element index", iStateElement, 0, this._nStateElements - 1);
        }
        if (iTime !== null) {
            checkIntegerInRange("Time index", iTime, 0, this._nTimes - 1);
        }
    }
}
