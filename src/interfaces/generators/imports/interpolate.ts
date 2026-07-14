import { DimUtils } from "./array";

// this function finds the time index in the times array that is just before the targetTime
const interpolateSearch = (targetTime: number, times: number[], allowExtrapolateRhs: boolean) => {
    if (targetTime < times[0]) {
        throw new Error(`Tried to interpolate at time t = ${targetTime}, which is before first time (${times[0]})`);
    }

    const n = times.length;

    const upperTimeIdx = times.findIndex((t) => targetTime <= t);
    if (upperTimeIdx === -1) {
        // target time greater than all times
        if (allowExtrapolateRhs) {
            return n - 1;
        } else {
            throw new Error(
                `Tried to interpolate at time t = ${targetTime}, which is after last time (${times[n - 1]})`
            );
        }
    }

    return times[upperTimeIdx] !== targetTime ? upperTimeIdx - 1 : upperTimeIdx;
};

const validateTime = (times: number[], lengthY: number, nameT: string, nameY: string) => {
    if (times.length !== lengthY) {
        throw new Error(
            `Time variable '${nameT}' and interpolation target '${nameY}' must have the same length, ` +
                `but do not (${times.length} vs ${lengthY})`
        );
    }

    for (let i = 1; i < times.length; i++) {
        if (times[i - 1] >= times[i]) {
            throw new Error(`Time variable '${nameT}' must be strictly increasing but was not at index ${i}`);
        }
    }
};

class InterpolateConstant {
    constructor(
        public times: number[],
        public y: number[],
        nameT: string,
        nameY: string
    ) {
        validateTime(times, y.length, nameT, nameY);
    }

    eval = (t: number) => {
        const idx = interpolateSearch(t, this.times, true);
        return this.y[idx];
    };
}

class InterpolateConstantArray {
    constructor(
        public times: number[],
        public y: number[],
        public dimTarget: DimUtils,
        nameT: string,
        nameY: string
    ) {
        const lengthY = y.length / dimTarget.size;
        validateTime(times, lengthY, nameT, nameY);
    }

    eval = (t: number) => {
        const idx = interpolateSearch(t, this.times, true);
        const size = this.dimTarget.size;
        const startOffset = size * idx;
        return this.y.slice(startOffset, startOffset + size);
    };
}

export const interpolate = {
    InterpolateConstant,
    InterpolateConstantArray
};
