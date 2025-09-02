import ndarray from "ndarray";
import { checkIntegerInRange } from "./utils.ts";
import { ArrayState } from "./SystemState.ts";

export class SystemSimulateResult {
    private _nGroups: number;
    private readonly _nParticles: number;
    private readonly _nStateElements: number;
    private readonly _nTimes: number;
    private readonly _resultValues: ndarray.NdArray;

    constructor(nGroups: number, nParticles: number, nStateElements: number, nTimes: number) {
        // TODO: we could include the times themselves, not just time indexes and be able to get state for those
        // TODO: same for state element names

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

    public setValuesForTime(iGroup: number, iParticle: number, iTime: number, stateValues: number[]) {
        this.checkIndexes(iGroup, iParticle, null, iTime);
        if (stateValues.length !== this._nStateElements) {
            throw RangeError(`Expected ${this._nStateElements} state values but got ${stateValues.length}.`);
        }
        for (let i = 0; i < stateValues.length; i++) {
            this._resultValues.set(iGroup, iParticle, i, iTime, stateValues[i]);
        }
    }

    public resultValues() {
        return this._resultValues;
    }

    public getValuesForTime(iGroup: number, iParticle: number, iTime: number): ArrayState {
        this.checkIndexes(iGroup, iParticle, null, iTime);
        return this._resultValues.pick(iGroup, iParticle, null, iTime);
    }

    // for all times
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
