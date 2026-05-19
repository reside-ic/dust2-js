import ndarray from "ndarray";
import { checkIntegerInRange, checkIndicesForMax, checkNestedArrayLengthsMatch, getRangeFromZero } from "./utils.ts";
import { DustParameterError } from "./errors.ts";

/**
 * Interface representing array-like state, e.g. all state values for a particle, or all time values for a single state
 * element.
 */
export interface ArrayState {
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

export type ParticleState = ArrayState;

export type ParticleSubState = number[];

/**
 * Type used for full or partial state updates.
 */
export type SystemSubState = ParticleSubState[];

/**
 * Class representing the state of a {@link SystemInterface} made up of {@link SystemState.nParticles | nParticles}
 * particles, where each particle contains {@link SystemState.nStateElements | nStateElements} numeric values.
 */
export class SystemState {
    private _state: ndarray.NdArray;
    private _stateNext: ndarray.NdArray; // a working area for building next state value before swapping into _state
    private readonly _nParticles: number;
    private readonly _nStateElements: number;

    /**
     *
     * @param nParticles The number of particles
     * @param nStateElements The number of numeric state values in each particle
     */
    constructor(nParticles: number, nStateElements: number) {
        this._nParticles = nParticles;
        this._nStateElements = nStateElements;
        this._state = this.newState();
        this._stateNext = this.newState();
    }

    private newState() {
        // arrange the ndArray with dimensions: particle, stateElement
        const len = this._nParticles * this._nStateElements;
        return ndarray(new Array<number>(len).fill(0), [this._nParticles, this._nStateElements]);
    }

    /**
     * The number of particles in the system
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
     * Returns a slice of the underlying state which is a view of a particular particle
     * @param iParticle The particle index to get
     */
    public getParticle(iParticle: number): ArrayState {
        this.checkIndex(iParticle);
        return this._state.pick(iParticle, null);
    }

    /**
     * Updates the underlying state with the given values for a particular particle
     * @param iParticle The particle index to set values for
     * @param values The values to set in the underlying state
     */
    public setParticle(iParticle: number, values: number[]): void {
        this.checkIndex(iParticle);
        if (values.length !== this._nStateElements) {
            throw new RangeError(`Particle state array must be of length ${this._nStateElements}.`);
        }
        for (let i = 0; i < values.length; i++) {
            this._state.set(iParticle, i, values[i]);
        }
    }

    private checkIndex(iParticle: number) {
        checkIntegerInRange("Particle index", iParticle, 0, this._nParticles - 1);
    }

    /**
     * Apply a reordering to every particle according to a reordering parameter which defines a new order.
     * @param reordering {@link https://github.com/scijs/ndarray | NdArray } whose first dimension defines a new order
     * of particles. For example, if this state has three particles, a reordering of `[2, 0, 1]` would imply that its
     * current third particle should be reordered to the first position, its current first particle to the second
     * position, and its current second particle to the third position. Reordering can also perform filtering and
     * duplication i.e. indexes between 0 and {@link nParticles} - 1 may be repeated or omitted in the reordering.
     */
    public reorder(reordering: ndarray.NdArray) {
        const shape = reordering.shape;
        if (shape.length !== 1 || shape[0] !== this._nParticles) {
            throw new DustParameterError(
                "Unexpected reordering shape. " + `Expected [${this._nParticles}] but got ${JSON.stringify(shape)}.`
            );
        }
        // Check that each reordering contains expected values
        for (let newParticleIndex = 0; newParticleIndex < this._nParticles; newParticleIndex++) {
            checkIntegerInRange("Reordering index", reordering.get(newParticleIndex), 0, this._nParticles - 1);
        }

        this.reorderNoCheck(reordering);
    }

    // We'll use this eventually when we want to generate our own indexes internal to the package
    private reorderNoCheck(reordering: ndarray.NdArray) {
        for (let newParticleIndex = 0; newParticleIndex < this._nParticles; newParticleIndex++) {
            const oldParticleIndex = reordering.get(newParticleIndex);
            const particleValues = this.getParticle(oldParticleIndex);
            for (let iStateElement = 0; iStateElement < this._nStateElements; iStateElement++) {
                this._stateNext.set(newParticleIndex, iStateElement, particleValues.get(iStateElement));
            }
        }

        [this._state, this._stateNext] = [this._stateNext, this._state]; // swap
    }

    /**
     * @copyDoc SystemInterface.setState
     */
    public setState(newState: SystemSubState, particleIndices: number[] = [], stateElementIndices: number[] = []) {
        // Check that the dimensions of new state actually match size of the indices arrays
        // provided (or the relevant dimension of the whole state if not)
        const expectedNewStateLengths = [
            particleIndices.length || this._nParticles,
            stateElementIndices.length || this._nStateElements
        ];
        const expectedNewStateNames = ["newState Particles", "newState State Elements"];
        checkNestedArrayLengthsMatch(newState, expectedNewStateLengths, expectedNewStateNames);

        const iterateIndices = (
            name: string,
            indices: number[],
            stateIndexCount: number,
            f: (index: number, i: number) => void
        ) => {
            // Each of the index arrays provided may be empty, in which case we should iterate over all the indices
            // in the state
            // We also validate non-empty index arrays here
            if (indices.length) {
                checkIndicesForMax(name, indices, stateIndexCount - 1);
            } else {
                indices = getRangeFromZero(stateIndexCount);
            }

            for (let i = 0; i < indices.length; i++) {
                f(indices[i], i);
            }
        };

        iterateIndices("Particle index", particleIndices, this._nParticles, (p: number, ip: number) => {
            iterateIndices(
                "State Element index",
                stateElementIndices,
                this._nStateElements,
                (v: number, iv: number) => {
                    this._state.set(p, v, newState[ip][iv]);
                }
            );
        });
    }
}
