import { expect, test } from "vitest";
import { resample } from "../src/resample";

// Sample sets of u, w and result from the R implementation - with the result indexes shifted back 1 to no longer be
// 1-indexed!
const sample1 = {
    u: 0.06986051,
    weights: [0.019088169, 0.538700715, 0.022724325, 0.110358560, 0.023474925, 0.001216593,
              0.058643378, 1, 0.007363703, 0.013855975, 0.009302719, 0.022136699,
              0.091886086, 0.084838106, 0.002934530, 0.022197226, 0.088122091, 0.288347958,
              0.163829315, 0.001286831],
    result: [0, 1, 1, 1, 1, 3, 7, 7, 7, 7, 7, 7, 7, 7, 11, 13, 16, 17, 17, 18]
};

const sample2 = {
    u: 0.8947567,
    weights: [0.199120977, 0.056060287, 0.115732635, 0.033579278, 0.001514663, 0.037144679,
              0.016340364, 0.112734953, 0.051246824, 0.157887763, 0.133908897, 0.009185324,
              0.041430892, 0.166888607, 1, 0.009759700, 0.026224724, 0.349677617,
              0.242408128, 0.012312731],
    result: [0, 2, 3, 7, 9, 10, 12, 13, 14, 14, 14, 14, 14, 14, 14, 17, 17, 17, 18, 18]
};

test("resample returns expected indexes", () => {
    expect(resample(sample1.weights, sample1.u)).toStrictEqual(sample1.result);
    expect(resample(sample2.weights, sample2.u)).toStrictEqual(sample2.result);
});