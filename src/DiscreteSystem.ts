import { ParticleState, SystemState } from "./SystemState";
import { DiscreteSystemGenerator } from "./DiscreteSystemGenerator";
import { Packer } from "./Packer";
import { System } from "./System";
import { checkIntegerInRange, particleStateToArray } from "./utils.ts";

export class DiscreteSystem<TShared, TInternal> implements System {
    private readonly _generator: DiscreteSystemGenerator<TShared, TInternal>;
    private readonly _nParticles: number;
    private readonly _nGroups: number;
    private readonly _statePacker: Packer;
    private readonly _state: SystemState;
    private readonly _dt: number;
    private readonly _shared: TShared[];
    private readonly _internal: TInternal[];
    private _time: number;

    constructor(
        generator: DiscreteSystemGenerator<TShared, TInternal>,
        shared: TShared[],
        time: number,
        dt: number,
        nParticles: number
    ) {
        checkIntegerInRange("Number of particles", nParticles, 1);

        this._generator = generator;
        this._time = time;
        this._dt = dt;
        this._nParticles = nParticles; // number of particles per parameter set
        this._nGroups = shared.length; // number of parameter sets
        this._statePacker = generator.packingState(shared[0]);
        const nState = this._statePacker.length; // number of state elements in the packer, as defined by the generator

        this._state = new SystemState(this._nGroups, this._nParticles, nState);
        this._shared = shared;
        this._internal = shared.map((el) => generator.internal(el));
    }

    public setTime(value: number) {
        this._time = value;
    }

    public get state(): Readonly<SystemState> {
        return this._state as Readonly<SystemState>;
    }

    // helper method to iterate over all particles and execute the provided function
    private iterateParticles(f: (iGroup: number, iParticle: number) => void) {
        for (let iGroup = 0; iGroup < this._nGroups; iGroup++) {
            for (let iParticle = 0; iParticle < this._nParticles; iParticle++) {
                f(iGroup, iParticle);
            }
        }
    }

    public setStateInitial(): void {
        this.iterateParticles((iGroup: number, iParticle: number) => {
            const shared = this._shared[iGroup];
            const internal = this._internal[iGroup];
            const state = this._state.getParticle(iGroup, iParticle);
            const arrayState = particleStateToArray(state);
            this._generator.initial(this._time, shared, internal, arrayState);
            this._state.setParticle(iGroup, iParticle, arrayState);
        });
    }

    public runToTime(time: number): void {
        if (time < this._time) {
            throw RangeError(`Cannot run to requested time ${time}, which is less than current time ${this._time}.`);
        }
        const nSteps = (time - this._time) / this._dt;
        this.iterateParticles((iGroup: number, iParticle: number) => {
            const shared = this._shared[iGroup];
            const internal = this._internal[iGroup];
            const state = this.runParticle(shared, internal, this._state.getParticle(iGroup, iParticle), nSteps);
            this._state.setParticle(iGroup, iParticle, state);
        });
        this._time = time;
    }

    private runParticle(shared: TShared, internal: TInternal, particleState: ParticleState, nSteps: number): number[] {
        let state = particleStateToArray(particleState);
        let stateNext = [...state];
        let time = this._time;
        for (let i = 0; i < nSteps; i++) {
            this._generator.update(time, this._dt, state, shared, internal, stateNext);
            time += this._dt;
            const tmp = state;
            state = stateNext;
            stateNext = tmp;
        }
        return state;
    }
}
