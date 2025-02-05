import ndarray from "ndarray";

export interface ParticleState {
    get: (i: number) => number;
    set: (i: number, value: number) => void;
}

// TODO: use integers rather than numbers..?

export class SystemState {
    private readonly state: ndarray.NdArray;
    private readonly nGroups: number;
    private readonly nParticles: number;
    private readonly nStateElements: number;

    constructor(nGroups: number, nParticles: number, nStateElements: number) {
        this.nGroups = nGroups;
        this.nParticles = nParticles;
        this.nStateElements = nStateElements;
        // arrange the nd array with dimensions: group, particle, stateElement
        const len = nGroups * nParticles * nStateElements;
        this.state = ndarray(new Array<number>(len).fill(0), [nGroups, nParticles, nStateElements]);
    }

    // Return an ndArray which is a view of a particle slice of the underlying array
    public getParticle(iGroup: number, iParticle: number): ParticleState {
        this.checkIndexes(iGroup, iParticle);
        return this.state.pick(iGroup, iParticle, null);
    }

    // Update the underlying array with the given state values for a particular particle
    public setParticle(iGroup: number, iParticle: number, values: number[]): void {
        this.checkIndexes(iGroup, iParticle);
        if (values.length !== this.nStateElements) {
            throw new RangeError(`Particle array must be of length ${this.nStateElements}`);
        }
        for (let i = 0; i < values.length; i++) {
            this.state.set(iGroup, iParticle, i, values[i]);
        }
    }

    private checkIndexes(iGroup: number, iParticle: number) {
        // TODO: integers?
        if (iGroup < 0 || iGroup >= this.nGroups) {
            throw new RangeError(`Group index must be between 0 and ${this.nGroups - 1}`);
        }
        if (iParticle < 0 || iParticle >= this.nParticles) {
            throw new RangeError(`Particle index must be between 0 and ${this.nParticles - 1}`);
        }
    }

}