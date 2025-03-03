import { checkIntegerInRange } from "./utils.ts";

export class SystemDataComparison {
    public readonly nGroups: number;
    public readonly nParticles: number;
    private readonly _comparisonValues: (number | undefined)[][];

    constructor(nGroups: number, nParticles: number) {
        checkIntegerInRange("nGroups", nGroups, 1);
        checkIntegerInRange("nParticles", nParticles, 1);
        this.nGroups = nGroups;
        this.nParticles = nParticles;
        this._comparisonValues = [...new Array(nGroups)].map(() => new Array(nParticles));
    }

    private rangeCheck(iGroup: number, iParticle: number) {
        checkIntegerInRange("iGroup", iGroup, 0, this.nGroups - 1);
        checkIntegerInRange("iParticle", iParticle, 0, this.nParticles - 1);
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
