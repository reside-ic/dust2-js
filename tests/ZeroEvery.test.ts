import { describe, expect, test } from "vitest";
import { DiscreteSystem } from "../src/DiscreteSystem";
import { ABState, zeroTwice } from "./examples/zeroTwice";

const generator = zeroTwice;

const createSystem = (shared: ABState) =>
    new DiscreteSystem(
        generator,
        [shared],
        0, // time
        1, // dt
        1 // nParticles
    );

// TODO: remove when mrc-6246 is added
// https://mrc-ide.myjetbrains.com/youtrack/agiles/103-79/current?issue=mrc-6246
const simulateToTime = (shared: ABState, time: number) => {
    const ret = { a: [] as number[], b: [] as number[] };
    const sys = createSystem(shared);
    sys.setStateInitial();
    for (let i = 1; i < time + 1; i++) {
        sys.runToTime(i);
        ret.a.push(sys.state.getParticle(0, 0).get(0));
        ret.b.push(sys.state.getParticle(0, 0).get(1));
    }
    return ret;
};

// fill array of length `length` with [1 ... n] so n = 2, length = 5 returns
// [1, 2, 1, 2, 1]
const rep1ToN = (n: number, length: number) => Array.from({ length }, (_, i) => (i % n) + 1);

describe("Zero every", () => {
    test("can use zeroEvery", () => {
        const ret = simulateToTime({ a: 2, b: 300 }, 20);
        expect(ret.a).toStrictEqual(rep1ToN(2, 20));
        expect(ret.b).toStrictEqual(rep1ToN(20, 20));

        const ret1 = simulateToTime({ a: 300, b: 2 }, 20);
        expect(ret1.a).toStrictEqual(rep1ToN(20, 20));
        expect(ret1.b).toStrictEqual(rep1ToN(2, 20));

        const ret2 = simulateToTime({ a: 300, b: 5 }, 20);
        expect(ret2.a).toStrictEqual(rep1ToN(20, 20));
        expect(ret2.b).toStrictEqual(rep1ToN(5, 20));

        const ret3 = simulateToTime({ a: 2, b: 5 }, 20);
        expect(ret3.a).toStrictEqual(rep1ToN(2, 20));
        expect(ret3.b).toStrictEqual(rep1ToN(5, 20));
    });
});
