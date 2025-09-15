/**
 * Given an array of weights, return an array of indexes into the weights array, where the number of times a weight's
 * index appears reflects that weight's value relative to the others. The result array will have the same length as the
 * weights array, and each index value will appear 0 or more times.
 *
 * @param weights The weights array
 * @param u A number usually drawn from the unform distribution (0-1) used to offset the values associated with the
 *          weights - this allows some random variation in the results of the resample beyond the weight values.
 */
export const resample = (weights: number[], u: number) => {
    const n = weights.length;
    if (!n) {
        throw RangeError("Weights cannot be empty.");
    }

    // Construct a series of increments uu, starting at u/n and separated  by 1/n, each of which has a weight
    // assigned to it according to which weight's region in the normalised cumulative sum of weights it
    // falls into
    const uOffset = u / n;
    const uIncrement = 1 / n;
    let uu = uOffset;

    const weightsSum = weights.reduce((total, current) => total + current, 0);
    const result = [];
    let weightIdx = 0;
    let cw = weights[0] / weightsSum; // normalised cumulative weight
    while (result.length < n) {
        // On each try, see if the next uu can go in the result for the current weight index
        // If so, add it and increment uu
        // If not, increment the weight index and the cw
        if (uu <= cw) {
            result.push(weightIdx);
            uu += uIncrement;
        } else {
            weightIdx++;
            cw += weights[weightIdx] / weightsSum;
        }
    }
    return result;
};
