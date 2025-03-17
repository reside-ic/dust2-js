import ndarray from "ndarray";
import { checkIntegerInRange } from "./utils.ts";

/**
 * Interface representing state for a particular particle, which is returned by {@link SystemState.getParticle}
 */
export interface ParticleState {
    /**
     * Get the values at index i
     * @param i
     */
    get: (i: number) => number;

    /**
     * Sets the value at index i
     * @param i
     * @param value
     */
    set: (i: number, value: number) => void;

    /**
     * Gets the number of state element values in the particle
     */
    size: number;
}

/**
 * Class representing the state of a {@link System} made up of {@link SystemState.nGroups | nGroups} groups with
 * {@link SystemState.nParticles | nParticles} particles in each group, where each particle contains
 * {@link SystemState.nStateElements | nStateElements} numeric values.
 */
export class SystemState {
    private readonly _state: ndarray.NdArray;
    private readonly _nGroups: number;
    private readonly _nParticles: number;
    private readonly _nStateElements: number;

    /**
     *
     * @param nGroups The number of groups in the state where each group shares model parameter values
     * @param nParticles The number of particles in each group
     * @param nStateElements The number of numeric state values in each particle
     */
    constructor(nGroups: number, nParticles: number, nStateElements: number) {
        this._nGroups = nGroups;
        this._nParticles = nParticles;
        this._nStateElements = nStateElements;
        // arrange the ndArray with dimensions: group, particle, stateElement
        const len = nGroups * nParticles * nStateElements;
        this._state = ndarray(new Array<number>(len).fill(0), [nGroups, nParticles, nStateElements]);
    }

    /**
     * The number of groups in the system
     */
    public get nGroups(): number {
        return this._nGroups;
    }

    /**
     * The number of particles per group in the system
     */
    public get nParticles(): number {
        return this._nParticles;
    }

    /**
     * The number of numeric state values in each particle in the system
     */
    public get nStateElements(): number {
        return this._nStateElements;
    }

    /**
     * Returns a slice of the underlying state which is a view of a particular group and particle
     * @param iGroup The group index to get
     * @param iParticle The particle index to get
     */
    public getParticle(iGroup: number, iParticle: number): ParticleState {
        this.checkIndexes(iGroup, iParticle);
        return this._state.pick(iGroup, iParticle, null);
    }

    /**
     * Updates the underlying state with the given values for a particular particle
     * @param iGroup The group index to set values for
     * @param iParticle The particle index to set values for
     * @param values The values to set in the underlying state
     */
    public setParticle(iGroup: number, iParticle: number, values: number[]): void {
        this.checkIndexes(iGroup, iParticle);
        if (values.length !== this._nStateElements) {
            throw new RangeError(`Particle state array must be of length ${this._nStateElements}.`);
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
