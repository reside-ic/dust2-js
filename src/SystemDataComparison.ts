import { checkIntegerInRange } from "./utils.ts";

export class SystemDataComparison {
    private readonly _nGroups: number;
    private readonly _nParticles: number;
    private readonly  _comparisonValues: (number | undefined)[][];

    constructor(
        nGroups: number,
        nParticles: number
    ) {
        checkIntegerInRange("nGroups", nGroups, 0);
        checkIntegerInRange("nParticles", nParticles, 0);
        this._comparisonValues = [...new Array(nGroups)].map((i) => new Array(nParticles));
    }

    private rangeCheck(iGroup: number, iParticle: number) {
        checkIntegerInRange("iGroup", iGroup, 0, this._nGroups - 1);
        checkIntegerInRange("iParticle", iParticle, this._nParticles - 1);
    }

    setValue(iGroup: number, iParticle: number, value: number) {
        this.rangeCheck(iGroup, iParticle);
        this._comparisonValues[iGroup][iParticle] = value;
    }

    getValue(iGroup: number, iParticle: number) {
        this.rangeCheck(iGroup, iParticle);
        return this._comparisonValues[iGroup][iParticle];
    }
}