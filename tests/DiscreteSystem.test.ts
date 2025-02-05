import { describe, test, expect } from "vitest";
import { DiscreteSIR } from "./examples/sir";
import { DiscreteSystem } from "../src/DiscreteSystem.ts";

const generator = new DiscreteSIR();

describe("DiscreteSystem", () => {
    test("can be created", () => {
        const shared = [
            { N: 1000000, I0: 1, beta: 4, gamma: 2},
            { N: 2000000, I0: 2, beta: 8, gamma: 4},
        ];
        const sys = new DiscreteSystem<DiscreteSIR>(
            generator,
            shared,
            5, // time
            0.5, // dt
            3 // nParticles
        );

        expect(sys["generator"]).toBe(generator);
        expect(sys["time"]).toBe(5);
        expect(sys["dt"]).toBe(0.5);
        expect(sys["nParticles"]).toBe(3);
        expect(sys["nGroups"]).toBe(2);

        const packer = sys["statePacker"];
        expect(packer.length).toBe(5);

        const state = sys["state"];
        expect(state["nGroups"]).toBe(2);
        expect(state["nParticles"]).toBe(3);
        expect(state["nStateElements"]).toBe(5);

        expect(sys["shared"]).toBe(shared);
        expect(sys["internal"]).toStrictEqual([null, null]);
    });

    test("can be initialised", () => {});

    test("can run to time", () => {});
});