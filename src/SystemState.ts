import ndarray from "ndarray";
import { checkIntegerInRange } from "./utils.ts";

export interface ParticleState {
    get: (i: number) => number;
    set: (i: number, value: number) => void;
}

export class SystemState {
    private readonly _state: ndarray.NdArray;
    private readonly _nGroups: number;
    private readonly _nParticles: number;
    private readonly _nStateElements: number;

    constructor(nGroups: number, nParticles: number, nStateElements: number) {
        this._nGroups = nGroups;
        this._nParticles = nParticles;
        this._nStateElements = nStateElements;
        // arrange the ndArray with dimensions: group, particle, stateElement
        const len = nGroups * nParticles * nStateElements;
        this._state = ndarray(new Array<number>(len).fill(0), [nGroups, nParticles, nStateElements]);
    }

    // Return an ndArray which is a view of a particle slice of the underlying array
    public getParticle(iGroup: number, iParticle: number): ParticleState {
        this.checkIndexes(iGroup, iParticle);
        return this._state.pick(iGroup, iParticle, null);
    }

    // Update the underlying array with the given state values for a particular particle
    public setParticle(iGroup: number, iParticle: number, values: number[]): void {
        this.checkIndexes(iGroup, iParticle);
        if (values.length !== this._nStateElements) {
            throw new RangeError(`Particle array must be of length ${this._nStateElements}`);
        }
        for (let i = 0; i < values.length; i++) {
            this._state.set(iGroup, iParticle, i, values[i]);
        }
    }

    private checkIndexes(iGroup: number, iParticle: number) {
        checkIntegerInRange("Group index", iGroup, 0, this._nGroups - 1);
        checkIntegerInRange("Particle index", iParticle, 0, this._nParticles - 1);
    }
}
