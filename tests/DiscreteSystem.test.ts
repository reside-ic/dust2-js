import { describe, test } from "vitest";
import { DiscreteSIR } from "./examples/sir";
import { DiscreteSystem } from "../src/DiscreteSystem.ts";

//const generator = new DiscreteSIR();

describe("DiscreteSystem", () => {
    test("can be created", () => {
        const sys = new DiscreteSystem<DiscreteSIR>();
    });

    test("can be initialised", () => {});

    test("can run to time", () => {});
});