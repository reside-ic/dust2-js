import { expect, test } from "vitest";
import { resample } from "../src/resample";

// Sample sets of u, w and results from the R implementation - with the result indexes shifted back 1 to no longer be
// 1-indexed!
// sample1 - weights are abs rcauchy values normalised to <= 1
const sample1 = {
    u: 0.06986051,
    weights: [
        0.019088169, 0.538700715, 0.022724325, 0.11035856, 0.023474925, 0.001216593, 0.058643378, 1, 0.007363703,
        0.013855975, 0.009302719, 0.022136699, 0.091886086, 0.084838106, 0.00293453, 0.022197226, 0.088122091,
        0.288347958, 0.163829315, 0.001286831
    ],
    result: [0, 1, 1, 1, 1, 3, 7, 7, 7, 7, 7, 7, 7, 7, 11, 13, 16, 17, 17, 18]
};

// sample2 - weights are abs rcauchy values which have not been normalised
const sample2 = {
    u: 0.743724,
    weights: [
        0.196809, 4.5023123, 0.8761269, 1.276677, 0.2772459, 0.3513575, 34.6684442, 0.3435429, 5.5966848, 0.7134911,
        0.6687651, 0.268905, 2.5180958, 0.5147385, 0.5930055, 7.6698852, 1.393964, 3.6808606, 2.1501077, 0.3640676
    ],
    result: [1, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 8, 12, 15, 15, 15, 17, 18]
};

test("resample returns expected indexes", () => {
    expect(resample(sample1.weights, sample1.u)).toStrictEqual(sample1.result);
    expect(resample(sample2.weights, sample2.u)).toStrictEqual(sample2.result);
});

test("resample throws error when passed empty weights array", () => {
    expect(() => resample([], sample1.u)).toThrow("Weights cannot be empty.");
});
