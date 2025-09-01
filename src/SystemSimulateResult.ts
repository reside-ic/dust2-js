import ndarray from "ndarray";
import { checkIntegerInRange } from "./utils.ts";
import { ArrayState } from "./SystemState.ts";

export class SystemSimulateResult {
    private _nGroups: number;
    private _nParticles: number;
    private _nStateElements: number;
    private _nTimes: number;
    private _resultValues: ndarray.NdArray;

    constructor(nGroups: number, nParticles: number, nStateElements: number, nTimes: number) {
        this._nGroups = nGroups;
        this._nParticles = nParticles;
        this._nStateElements = nStateElements;
        this._nTimes = nTimes;

        // TODO: should include the times themselves, not just time indexes and be able to get state for those
        // TODO: same for state element names

        // arrange the ndArray with dimensions: group, particle, stateElement * time
        const len = this._nGroups * this._nParticles * this._nStateElements * this._nTimes;
        this._resultValues = ndarray(new Array<number>(len).fill(0), [this._nGroups, this._nParticles, this._nStateElements, this._nTimes]);
    }

    public setValuesForTime(iGroup: number, iParticle: number, iTime: number, stateValues: number[]){
        this.checkIndexes(iGroup, iParticle, null, iTime);
        // TODO: validate number of state values
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
            checkIntegerInRange("StateElement index", iStateElement, 0, this._nStateElements - 1);
        }
        if (iTime !== null) {
            checkIntegerInRange("Time index", iTime, 0, this._nTimes - 1)
        }
    }
}