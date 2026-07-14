type Op = (agg: number, x: number) => number;
type Range = [number, number];

// this file is based on dust2's implementation, for more details see:
// https://github.com/mrc-ide/dust2/blob/83721f78fda9b4124e1cda3ae24e3f2da82ca2d0/inst/include/dust2/array.hpp#L115
//
// it calculates column major flat indicies from subranges along each dimension and applies
// +, *, ... operations to those values

const reduceAll = (arr: number[], op: Op, init: number) => {
    return arr.reduce(op, init);
};

const reduce1 = (arr: number[], _dim: DimUtils, i: Range, op: Op, init: number) => {
    let ret = init;
    for (let ii = i[0]; ii <= i[1]; ii++) {
        ret = op(ret, arr[ii]);
    }
    return ret;
};

const reduce2 = (arr: number[], dim: DimUtils, i: Range, j: Range, op: Op, init: number) => {
    let ret = init;
    for (let jj = j[0]; jj <= j[1]; jj++) {
        for (let ii = i[0]; ii <= i[1]; ii++) {
            ret = op(ret, arr[ii + jj * dim.mult[1]]);
        }
    }
    return ret;
};

const reduce3 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range, op: Op, init: number) => {
    let ret = init;
    for (let kk = k[0]; kk <= k[1]; kk++) {
        for (let jj = j[0]; jj <= j[1]; jj++) {
            for (let ii = i[0]; ii <= i[1]; ii++) {
                ret = op(ret, arr[ii + jj * dim.mult[1] + kk * dim.mult[2]]);
            }
        }
    }
    return ret;
};

const reduce4 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range, l: Range, op: Op, init: number) => {
    let ret = init;
    for (let ll = l[0]; ll <= l[1]; ll++) {
        for (let kk = k[0]; kk <= k[1]; kk++) {
            for (let jj = j[0]; jj <= j[1]; jj++) {
                for (let ii = i[0]; ii <= i[1]; ii++) {
                    ret = op(ret, arr[ii + jj * dim.mult[1] + kk * dim.mult[2] + ll * dim.mult[3]]);
                }
            }
        }
    }
    return ret;
};

const sumOp = (agg: number, x: number) => agg + x;
const sumAll = (arr: number[]) => {
    return reduceAll(arr, sumOp, 0);
};
const sum1 = (arr: number[], dim: DimUtils, i: Range) => {
    return reduce1(arr, dim, i, sumOp, 0);
};
const sum2 = (arr: number[], dim: DimUtils, i: Range, j: Range) => {
    return reduce2(arr, dim, i, j, sumOp, 0);
};
const sum3 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range) => {
    return reduce3(arr, dim, i, j, k, sumOp, 0);
};
const sum4 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range, l: Range) => {
    return reduce4(arr, dim, i, j, k, l, sumOp, 0);
};

const prodOp = (agg: number, x: number) => agg * x;
const prodAll = (arr: number[]) => {
    return reduceAll(arr, prodOp, 1);
};
const prod1 = (arr: number[], dim: DimUtils, i: Range) => {
    return reduce1(arr, dim, i, prodOp, 1);
};
const prod2 = (arr: number[], dim: DimUtils, i: Range, j: Range) => {
    return reduce2(arr, dim, i, j, prodOp, 1);
};
const prod3 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range) => {
    return reduce3(arr, dim, i, j, k, prodOp, 1);
};
const prod4 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range, l: Range) => {
    return reduce4(arr, dim, i, j, k, l, prodOp, 1);
};

const minOp = (agg: number, x: number) => Math.min(agg, x);
const minAll = (arr: number[]) => {
    return reduceAll(arr, minOp, Infinity);
};
const min1 = (arr: number[], dim: DimUtils, i: Range) => {
    return reduce1(arr, dim, i, minOp, Infinity);
};
const min2 = (arr: number[], dim: DimUtils, i: Range, j: Range) => {
    return reduce2(arr, dim, i, j, minOp, Infinity);
};
const min3 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range) => {
    return reduce3(arr, dim, i, j, k, minOp, Infinity);
};
const min4 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range, l: Range) => {
    return reduce4(arr, dim, i, j, k, l, minOp, Infinity);
};

const maxOp = (agg: number, x: number) => Math.max(agg, x);
const maxAll = (arr: number[]) => {
    return reduceAll(arr, maxOp, -Infinity);
};
const max1 = (arr: number[], dim: DimUtils, i: Range) => {
    return reduce1(arr, dim, i, maxOp, -Infinity);
};
const max2 = (arr: number[], dim: DimUtils, i: Range, j: Range) => {
    return reduce2(arr, dim, i, j, maxOp, -Infinity);
};
const max3 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range) => {
    return reduce3(arr, dim, i, j, k, maxOp, -Infinity);
};
const max4 = (arr: number[], dim: DimUtils, i: Range, j: Range, k: Range, l: Range) => {
    return reduce4(arr, dim, i, j, k, l, maxOp, -Infinity);
};

const assignArrayToSliceOfArray = (bigArr: number[], startOffset: number, smallArr: number[]) => {
    for (let i = startOffset; i < startOffset + smallArr.length; i++) {
        bigArr[i] = smallArr[i - startOffset];
    }
};

// useful utility for getting/calculating dim information,
// mult is partial product of all dimensions up to that dimension
export type DimUtils = {
    dim: number[];
    size: number;
    mult: number[];
};

/*
  Example usage
  =============

  const dim = getDimObj();

  dim.x = [2, 3, 5]; // setter triggers and will calculate dim, size and mult
  
  console.log(dim.x)
  -> {
    dim: [2, 3, 5], // same as input
    size: 30, // 2 * 3 * 5, total size of flat array
    mult: [1, 2, 6] // stride length, cumulative prod of dim starting at 1
  }
*/
const getDimObj = () => {
    const dim: Record<string, DimUtils> = {};
    return new Proxy(dim, {
        set(target, p: string, newValue: number[]) {
            if (newValue.length === 0) {
                target[p] = { dim: [], size: 1, mult: [] };
                return true;
            }

            const prod = [1];
            for (let i = 0; i < newValue.length; i++) {
                const d = newValue[i];
                prod.push(prod[i] * d);
            }
            const size = prod.at(-1)!;
            target[p] = { dim: newValue, size, mult: prod.slice(0, -1) };
            return true;
        }
    });
};

export const array = {
    sumAll,
    sum1,
    sum2,
    sum3,
    sum4,
    prodAll,
    prod1,
    prod2,
    prod3,
    prod4,
    minAll,
    min1,
    min2,
    min3,
    min4,
    maxAll,
    max1,
    max2,
    max3,
    max4,
    assignArrayToSliceOfArray,
    getDimObj
};
