import ndarray from "ndarray";
import { checkIntegerInRange } from "./utils.ts";
import { DustParameterError } from "./errors.ts";

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
    private _state: ndarray.NdArray;
    private _stateNext: ndarray.NdArray; // a working area for building next state value before swapping into _state
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
        this._state = this.newState();
        this._stateNext = this.newState();
    }

    private newState() {
        // arrange the ndArray with dimensions: group, particle, stateElement
        const len = this._nGroups * this._nParticles * this._nStateElements;
        return ndarray(new Array<number>(len).fill(0), [this._nGroups, this._nParticles, this._nStateElements]);
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

    /**
     * Apply a reordering to the particles in every group according to a reordering parameter which defines
     * a new order for each group.
     * @param reordering {@link https://github.com/scijs/ndarray | NdArray } whose first dimension defines group index
     * and whose second dimension defines a new order of particles for each group. For example, if this state has three
     * particles per group, a reordering of `[2, 0, 1]` for any group would imply that its current third particle should
     * be reordered to the first position, its current first particle to the second position, and its current second
     * particle to the third position. Reordering can also perform filtering and duplication i.e. indexes between 0
     * and {@link nParticles} - 1 may be repeated or omitted in the reordering.
     */
    public reorder(reordering: ndarray.NdArray) {
        const shape = reordering.shape;
        if (shape.length !== 2 || shape[0] !== this._nGroups || shape[1] !== this._nParticles) {
            throw new DustParameterError(
                "Unexpected reordering shape. " +
                    `Expected [${this._nGroups},${this._nParticles}] but got ${JSON.stringify(shape)}.`
            );
        }
        // Check that each reordering contains expected values
        for (let iGroup = 0; iGroup < this._nGroups; iGroup++) {
            for (let newParticleIndex = 0; newParticleIndex < this._nParticles; newParticleIndex++) {
                checkIntegerInRange(
                    "Reordering index",
                    reordering.get(iGroup, newParticleIndex),
                    0,
                    this._nParticles - 1
                );
            }
        }

        this.reorderNoCheck(reordering);
    }

    // We'll use this eventually when we want to generate our own indexes internal to the package
    private reorderNoCheck(reordering: ndarray.NdArray) {
        for (let iGroup = 0; iGroup < this._nGroups; iGroup++) {
            for (let newParticleIndex = 0; newParticleIndex < this._nParticles; newParticleIndex++) {
                const oldParticleIndex = reordering.get(iGroup, newParticleIndex);
                const particleValues = this.getParticle(iGroup, oldParticleIndex);
                for (let iStateElement = 0; iStateElement < this._nStateElements; iStateElement++) {
                    this._stateNext.set(iGroup, newParticleIndex, iStateElement, particleValues.get(iStateElement));
                }
            }
        }

        [this._state, this._stateNext] = [this._stateNext, this._state]; // swap
    }
}
