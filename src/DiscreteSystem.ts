import {ndarray} from "@stdlib/types/ndarray";

class DiscreteSystem<TShared, TInternal> implements System {
    private readonly nParticles: number;
    private readonly nGroups: number;
    private readonly nParticlesTotal: number;
    private readonly packerState: Packer; // packing for state, not state of packer
    private time: number;
    private dt: number;
    
    constructor(generator: DiscreteSystemGenerator<TShared, TInternal>,
                shared: TShared[],
                time: number,
                dt: number,
                nParticles: number) {
        this.nParticles = nParticles;
        this.nGroups = shared.length;
        this.nParticlesTotal = nParticles * nGroups;
        this.packerState = generator.packingState(shared[0]);
        const nState = this.packerState.len;

        const dims = [nState, this.nParticles, this.nGroups]; // TODO: reverse later?
        const len = prod(dims);
        this.state = array(new Array(len).fill(0), {shape: dims});
        this.shared = shared;
        this.internal = shared.map((el) => generator.internal(el));
    }

    // Could do this as a property with a setter. We need a function
    // ultimately for the ODE version as we will reset the solver.
    setTime(time: number): void {
        this.time = time;
    }

    setStateInitial(): void {
        for (let i = 0; i < this.nGroups; ++i) {
            for (let j = 0; j < this.nParticles; ++j) {
                const shared = this.shared[i];
                const internal = this.internal[i];
                const state = getParticleState(i, j);
                generator.initial(time, shared, initial, state);
                setParticleState(i, j, state);
            }
        }
    }

    // Do via property? Ideally return readonly with no copy.
    getState(): ndarray {
        return this.state;
    }

    runToTime(time: number): void {
        if (time < this.time) {
            // TODO: throw here
        }
        const nSteps = time - this.time / this.dt;
        for (let i = 0; i < this.nGroups; ++i) {
            for (let j = 0; j < this.nParticles; ++j) {
                const shared = this.shared[iGroup];
                const internal = this.internal[iGroup];
                // Extract out just the state for a particle.  This
                // will be (ideally!) a contiguous block of memory and
                // we'll turn that into a js number[] for now at
                // least.
                const state = runParticle(shared, internal, this.ParticleState(i, j), nSteps);
                this.setParticleState(i, j, state);
            }
        }
    }

    private runParticle(shared: TShared, internal: TInternal, state: number[], nSteps: number): number[] {
        let stateNext = [...state];
        let time = state.time;
        for (let i = 0; i < nSteps; ++i) {
            this.generator.update(time, this.dt, state, shared, internal, stateNext);
            time += this.dt;
            const tmp = state;
            state = stateNext;
            stateNext = tmp;
        }
        return state;
    }

    private setParticleState(iGroup: number, iParticle: number, state: number[]): void {
        for (let i = 0; i < state.length; ++i) {
            this.state[i, iParticle, iGroup] = state[i];
        }
    }

    private getParticleState(iGroup: number, iParticle: number): number[] {
        return ndarray2array(slice(this.state, new MultiSlice(null, iParticle, iGroup)));
    }
}
