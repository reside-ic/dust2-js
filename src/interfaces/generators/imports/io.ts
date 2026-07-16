import { DimUtils } from "./array";

const isNullish = (x: unknown) => x === null || x === undefined;

const errorIfMissingValueAndDefault = (par: unknown, parName: string, defaultValue?: unknown) => {
    if (isNullish(par) && isNullish(defaultValue)) {
        throw new Error(`'${parName}' must not be a missing value`);
    }
};

const checkScalar = (x: unknown, name: string) => {
    if (typeof x !== "number") {
        throw new Error(`'${name}' must be a scalar`);
    }
};

const readReal = <TParams extends Record<string, unknown>, ParName extends string>(
    params: TParams,
    parName: ParName,
    defaultValue?: TParams[ParName]
) => {
    const par = params[parName];
    errorIfMissingValueAndDefault(par, parName, defaultValue);

    if (isNullish(par)) {
        checkScalar(defaultValue, parName);
        return defaultValue!;
    }

    checkScalar(par, parName);
    return par;
};

const readInt = <TParams extends Record<string, unknown>, ParName extends string>(
    params: TParams,
    parName: ParName,
    defaultValue?: TParams[ParName]
) => {
    const par = readReal(params, parName, defaultValue);
    if (!Number.isInteger(par)) {
        throw new Error(`'${parName}' must be an integer`);
    }
    return par;
};

const readSize = <TParams extends Record<string, unknown>, ParName extends string>(
    params: TParams,
    parName: ParName,
    defaultValue?: TParams[ParName]
) => {
    const par = readReal(params, parName, defaultValue);
    const intPar = Math.round(par as number);
    if (intPar < 0) {
        throw new Error(`'${parName}' must be non-negative`);
    }
};

const readBool = <TParams extends Record<string, unknown>, ParName extends string>(
    params: TParams,
    parName: ParName,
    defaultValue?: TParams[ParName]
) => {
    const par = params[parName];
    errorIfMissingValueAndDefault(par, parName, defaultValue);

    if (isNullish(par)) return defaultValue!;

    return Boolean(par);
};

const checkDims = (par: number[], dims: number[], name: string) => {
    const size = dims.reduce((agg, dim) => agg * dim, 1);
    if (par.length !== size) {
        throw new Error(`Expected '${name}' to have size ${size} but got ${par.length}`);
    }
};

const readRealArray = <TParams extends Record<string, unknown>, ParName extends string>(
    params: TParams,
    parName: ParName,
    dim: DimUtils
) => {
    const par = params[parName] as number[];
    checkDims(par, dim.dim, parName);
    return par;
};

const readIntArray = <TParams extends Record<string, unknown>, ParName extends string>(
    params: TParams,
    parName: ParName,
    dim: DimUtils
) => {
    const par = params[parName] as number[];
    checkDims(par, dim.dim, parName);
    return par.map(Math.round);
};

const checkMinScalar = (par: number, min: number, name: string) => {
    if (par < min) {
        throw new Error(`'${name}' must be at least ${min}`);
    }
};

const checkMaxScalar = (par: number, max: number, name: string) => {
    if (par > max) {
        throw new Error(`'${name}' must be at most ${max}`);
    }
};

const checkMinArray = (par: number[], min: number, name: string) => {
    for (let i = 0; i < par.length; i++) {
        if (par[i] < min) {
            throw new Error(`All values of '${name}' must be at least ${min}`);
        }
    }
};

const checkMaxArray = (par: number[], max: number, name: string) => {
    for (let i = 0; i < par.length; i++) {
        if (par[i] > max) {
            throw new Error(`All values of '${name}' must be at most ${max}`);
        }
    }
};

export const io = {
    readReal,
    readInt,
    readSize,
    readBool,
    readRealArray,
    readIntArray,
    checkMinScalar,
    checkMaxScalar,
    checkMinArray,
    checkMaxArray
};
