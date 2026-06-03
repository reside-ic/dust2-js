import { DimUtils } from "./array";

const isNullish = (x: any) => x === null || x === undefined;

const errorIfMissingValueAndDefault = (
  par: any, parName: string, defaultValue?: any
) => {
  if (isNullish(par) && isNullish(defaultValue)) {
    throw new Error(`'${parName}' must not be a missing value`);
  }
};

const checkScalar = (x: any, name: string) => {
  if (typeof x !== "number") {
    throw new Error(`'${name}' must be a scalar`);
  }
};

const readReal = <TParams extends Record<string, any>, ParName extends string>(
  params: TParams, parName: ParName, defaultValue?: TParams[ParName]
) => {
  const par = params[parName];
  errorIfMissingValueAndDefault(par, parName, defaultValue);

  if (isNullish(par)) return defaultValue!;

  checkScalar(par, parName)
  return par;
};

const readInt = <TParams extends Record<string, any>, ParName extends string>(
  params: TParams, parName: ParName, defaultValue?: TParams[ParName]
) => {
  const par = readReal(params, parName, defaultValue);
  return Math.round(par);
};

const readSize = <TParams extends Record<string, any>, ParName extends string>(
  params: TParams, parName: ParName, defaultValue?: TParams[ParName]
) => {
  const par = readReal(params, parName, defaultValue);
  const intPar = Math.round(par);
  if (intPar < 0) {
    throw new Error(`'${parName}' must be non-negative`);
  }
};

const readBool = <TParams extends Record<string, any>, ParName extends string>(
  params: TParams, parName: ParName, defaultValue?: TParams[ParName]
) => {
  const par = params[parName];
  errorIfMissingValueAndDefault(par, parName, defaultValue);

  if (isNullish(par)) return defaultValue!;

  return Boolean(par);
};

const checkDims = (par: number[], dims: number[], name: string) => {
  const size = dims.reduce((agg, dim) => agg * dim, 1);
  if (par.length !== size) {
    throw new Error(
      `Expected '${name}' to have size ${size} but got ${par.length}`
    );
  }
};

const readRealArray = <TParams extends Record<string, any>, ParName extends string>(
  params: TParams, parName: ParName, dim: DimUtils
) => {
  const par = params[parName];
  checkDims(par, dim.dim, parName);
  return par;
};

const readIntArray = <TParams extends Record<string, any>, ParName extends string>(
  params: TParams, parName: ParName, dim: DimUtils
) => {
  const par = params[parName];
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

const readDims = <TParams extends Record<string, any>, ParName extends string>(
  params: TParams, parName: ParName, rank: number
) => {
  if (rank > 4) {
    throw new Error("Arrays of more than 4 dimensions not supported");
  }

  const dim: number[] = [];
  let arrAtCurrDepth: any = params[parName];
  let currRank = 0;
  while (currRank < rank) {
    dim.push(arrAtCurrDepth.length);
    arrAtCurrDepth = arrAtCurrDepth[0];
    if (arrAtCurrDepth === undefined) {
      throw new Error(`'${parName}' does not have the correct rank`);
    }
    currRank++;
  }

  return dim;
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
  checkMaxArray,
  readDims,
};
