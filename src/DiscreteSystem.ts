import { ParticleState, SystemState } from "./SystemState";
import { DiscreteSystemGenerator } from "./DiscreteSystemGenerator";
import { Packer } from "./Packer";
import { System } from "./System";

// Extract TShare and TInternal types from a TGenerator type
// TODO: can we make this even neater? Type alias within the class..?
type TShared<TGenerator> = TGenerator extends DiscreteSystemGenerator<infer T, infer U> ? T : never
type TInternal<TGenerator> = TGenerator extends DiscreteSystemGenerator<infer T, infer U> ? U : never;

export class DiscreteSystem<TGenerator extends DiscreteSystemGenerator<any, any>> implements System {
    //private static TThisShared = TShared<TGenerator>;
    private readonly generator: TGenerator
    private readonly nParticles: number;
    private readonly nGroups: number;
    //private readonly nParticlesTotal: number;
    private readonly statePacker: Packer;
    private readonly state: SystemState;
    private time: number;
    private dt: number;
    private shared: TShared<TGenerator>[];
    private internal: TInternal<TGenerator>[];
    //private shared: TShared[];
    //private internal: TInternal[];

    constructor(generator: TGenerator,
                shared: TShared<TGenerator>[],
                time: number,
                dt: number,
                nParticles: number) {
        this.generator = generator;
        this.time = time;
        this.dt = dt;
        this.nParticles = nParticles; // number of particles per parameter set
        this.nGroups = shared.length; // number of parameter sets
        //this.nParticlesTotal = nParticles * this.nGroups;
        this.statePacker = generator.packingState(shared[0]);
        const nState = this.statePacker.length; // number of variables in the packer, as defined by the generator

        //const dims = [nState, this.nParticles, this.nGroups]; // TODO: reverse later?
        //const len = prod(dims);
        //this.state = array(new Array(len).fill(0), {shape: dims});
        this.state = new SystemState(this.nGroups, this.nParticles, nState);
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
                const state = this.state.getParticle(i, j);
                const arrayState = this.particleStateToArray(state);
                this.generator.initial(this.time, shared, internal, arrayState);
                this.state.setParticle(i, j, arrayState);
            }
        }
    }

    // Do via property? Ideally return readonly with no copy.
    getState(): SystemState {
        return this.state;
    }

    runToTime(time: number): void {
        if (time < this.time) {
            // TODO: throw here
        }
        const nSteps = time - this.time / this.dt;
        for (let iGroup = 0; iGroup < this.nGroups; iGroup++) {
            for (let iParticle = 0; iParticle < this.nParticles; iParticle++) {
                const shared = this.shared[iGroup];
                const internal = this.internal[iGroup];
                // Extract out just the state for a particle.  This
                // will be (ideally!) a contiguous block of memory and
                // we'll turn that into a js number[] for now at
                // least.
                const state = this.runParticle(shared, internal, this.state.getParticle(iGroup, iParticle), nSteps);
                this.state.setParticle(iGroup, iParticle, state);
            }
        }
        this.time = time;
    }

    private particleStateToArray(state: ParticleState): number[] {
        const len = this.statePacker.length;
        const result = new Array<number>(len);
        for (let i = 0; i < len; i++) {
            result[i] = state.get(i);
        }
        return result;
    }

    private runParticle(shared: TShared<TGenerator>, internal: TInternal<TGenerator>, particleState: ParticleState, nSteps: number): number[] {
        let state = this.particleStateToArray(particleState);
        let stateNext = [...state];
        let time = this.time;
        for (let i = 0; i < nSteps; ++i) {
            this.generator.update(time, this.dt, state, shared, internal, stateNext);
            time += this.dt;
            const tmp = state;
            state = stateNext;
            stateNext = tmp;
        }
        return state;
    }

   /* private setParticleState(iGroup: number, iParticle: number, state: number[]): void {
        for (let i = 0; i < state.length; ++i) {
            this.state[i, iParticle, iGroup] = state[i];
        }

    }

    private getParticleState(iGroup: number, iParticle: number): number[] {
        return ndarray2array(slice(this.state, new MultiSlice(null, iParticle, iGroup)));
    }*/
}
