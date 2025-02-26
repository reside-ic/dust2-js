import { expect, test } from "vitest";

import { discreteSIR } from "./examples/discreteSIR";
import { Random, RngStateBuiltin } from "@reside-ic/random";

test("can do anything with our interface", () => {
    const state1 = Array<number>(5).fill(0);
    const state2 = Array<number>(5).fill(0);
    const shared = { N: 100, I0: 10, beta: 0.2, gamma: 0.1 };
    const random = new Random(new RngStateBuiltin());
    discreteSIR.initial(0, shared, null, state1, random);
    expect(state1).toStrictEqual([90, 10, 0, 0, 0]);
    discreteSIR.update(0, 1, state1, shared, null, state2, random);
    expect(state2).toStrictEqual([
        88.21788059760797, 10.830493582751622, 0.9516258196404048, 1.7821194023920273, 1.7821194023920273
    ]);
});
