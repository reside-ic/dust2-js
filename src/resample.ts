export const resample = (weights: number[], u: number) => {
    // TODO: validate weights not empty etc
    const n = weights.length;
    const uOffset = u / n;
    const uIncrement = 1 / n;

    const weightsSum = weights.reduce((total, current) => total + current, 0);
    const result = [];
    let uu = uOffset;
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
};