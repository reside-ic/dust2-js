import ndarray from "ndarray";
import { checkIntegerInRange } from "./utils.ts";
import { ArrayState, ParticleState } from "./SystemState.ts";

/**
 * Class which provides results of {@link System#simulate | System.simulate}, providing an underlying
 * {@link https://www.npmjs.com/package/ndarray | NdArray} as well as helper methods to
 * get state values by element index or time index.
 */
export class SystemSimulateResult {
    private _nGroups: number;
    private readonly _nParticles: number;
    private readonly _nStateElements: number;
    private readonly _nTimes: number;
    private readonly _resultValues: ndarray.NdArray;

    /**
     *
     * @param nGroups The number of groups in the {@link System}
     * @param nParticles The number of particles per group
     * @param nStateElements The number of state elements for which this object holds state values
     * @param nTimes The number of times for which this object holds state values
     */
    constructor(nGroups: number, nParticles: number, nStateElements: number, nTimes: number) {
        checkIntegerInRange("Number of groups", nGroups, 1);
        checkIntegerInRange("Number of particles", nParticles, 1);
        checkIntegerInRange("Number of state elements", nStateElements, 1);
        checkIntegerInRange("Number of times", nTimes, 1);

        this._nGroups = nGroups;
        this._nParticles = nParticles;
        this._nStateElements = nStateElements;
        this._nTimes = nTimes;

        // arrange the ndArray with dimensions: group, particle, stateElement * time
        const len = this._nGroups * this._nParticles * this._nStateElements * this._nTimes;
        this._resultValues = ndarray(new Array<number>(len).fill(0), [
            this._nGroups,
            this._nParticles,
            this._nStateElements,
            this._nTimes
        ]);
    }

    /**
     * Sets result state values for a given particle at a given time.
     * @param iGroup Index of the group
     * @param iParticle Index of the particle
     * @param iTime Index of the time - NB not time value, but the index in the times parameter provided to
     * {@link System#simulate  | System.simulate}
     * @param stateValues The state values to set, for all values requested in the stateElementIndices parameter
     * provided to {@link System#simulate  | System.simulate}
     */
    public setValuesForTime(iGroup: number, iParticle: number, iTime: number, stateValues: number[]) {
        this.checkIndexes(iGroup, iParticle, null, iTime);
        if (stateValues.length !== this._nStateElements) {
            throw RangeError(`Expected ${this._nStateElements} state values but got ${stateValues.length}.`);
        }
        for (let i = 0; i < stateValues.length; i++) {
            this._resultValues.set(iGroup, iParticle, i, iTime, stateValues[i]);
        }
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
     * @param iGroup Index of the group
     * @param iParticle Index of the particle
     * @param iTime Index of the time - NB not time value, but the index in the times parameter provided to
     * {@link System#simulate | System.simulate}
     */
    public getValuesForTime(iGroup: number, iParticle: number, iTime: number): ParticleState {
        this.checkIndexes(iGroup, iParticle, null, iTime);
        return this._resultValues.pick(iGroup, iParticle, null, iTime);
    }

    /**
     * Returns values at all time indexes, for a given state element index.
     *
     * @param iGroup Index of the group
     * @param iParticle Index of the particle
     * @param iStateElement Index of the state element - NB not the element index within the entire System state, but
     * the index in the stateElementIndices parameter provided to {@link System#simulate | System.simulate}
     */
    public getStateElement(iGroup: number, iParticle: number, iStateElement: number): ArrayState {
        this.checkIndexes(iGroup, iParticle, iStateElement, null);
        return this._resultValues.pick(iGroup, iParticle, iStateElement, null);
    }

    private checkIndexes(iGroup: number, iParticle: number, iStateElement: number | null, iTime: number | null) {
        checkIntegerInRange("Group index", iGroup, 0, this._nGroups - 1);
        checkIntegerInRange("Particle index", iParticle, 0, this._nParticles - 1);
        if (iStateElement !== null) {
            checkIntegerInRange("State Element index", iStateElement, 0, this._nStateElements - 1);
        }
        if (iTime !== null) {
            checkIntegerInRange("Time index", iTime, 0, this._nTimes - 1);
        }
    }
}
