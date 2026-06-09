import { describe, expect, test } from "vitest";
import { interpolate } from "../src/interfaces/generators/imports/interpolate";
import { DimUtils } from "../src/interfaces/generators/imports/array";

describe("interpolate", () => {
  const nameT = "t";
  const nameY = "y";

  test("interpolate constant throws error if times and y are different lengths", () => {
    const times = [1];
    const y = [1, 2];
    expect(() => {
      new interpolate.InterpolateConstant(times, y, nameT, nameY);
    }).toThrow(
      `Time variable '${nameT}' and interpolation target '${nameY}' `
      + "must have the same length, but do not (1 vs 2)"
    );
  });

  test("interpolate constant throws error if times is non increasing", () => {
    const times = [1, 2, 1];
    const y = [1, 2, 3];
    expect(() => {
      new interpolate.InterpolateConstant(times, y, nameT, nameY);
    }).toThrow(
      `Time variable '${nameT}' must be strictly increasing but was `
      + "not at index 2"
    );
  });

  test("interpolate constant eval works as expected", () => {
    const times = [1, 10, 50, 100];
    const y = [-1, -2, -3, -4];
    const i = new interpolate.InterpolateConstant(times, y, nameT, nameY);
    
    expect(() => {
      i.eval(0)
    }).toThrow(
      "Tried to interpolate at time t = 0, which is before "
      + "first time (1)"
    );

    expect(i.eval(1)).toBe(y[0]);
    expect(i.eval(1.1)).toBe(y[0]);
    expect(i.eval(9.9)).toBe(y[0]);
    expect(i.eval(10)).toBe(y[1]);
    expect(i.eval(49.99)).toBe(y[1]);
    expect(i.eval(50)).toBe(y[2]);
    expect(i.eval(50.01)).toBe(y[2]);
    expect(i.eval(99.999)).toBe(y[2]);
    expect(i.eval(100)).toBe(y[3]);
    expect(i.eval(100.001)).toBe(y[3]);
    expect(i.eval(100_000)).toBe(y[3]);
  });

  const dimUtils: DimUtils = { dim: [2, 3], size: 6, mult: [1, 2] };

  test("interpolate constant array throws error if times and y are different lengths", () => {
    const times = [1, 2];
    // dimUtils says this is 2 x 3, so this only have info for 1 time point
    const y = [
      1, 2, 3,
      4, 5, 6,
    ];
    expect(() => {
      new interpolate.InterpolateConstantArray(times, y, dimUtils, nameT, nameY);
    }).toThrow(
      `Time variable '${nameT}' and interpolation target '${nameY}' `
      + "must have the same length, but do not (2 vs 1)"
    );
  });

  test("interpolate constant array throws error if times is non increasing", () => {
    const times = [1, 0];
    // 2 time points
    const y = [
      1, 2, 3,
      4, 5, 6,

      1, 2, 3,
      4, 5, 6,
    ];
    expect(() => {
      new interpolate.InterpolateConstantArray(times, y, dimUtils, nameT, nameY);
    }).toThrow(
      `Time variable '${nameT}' must be strictly increasing but was `
      + "not at index 1"
    );
  });

  test("interpolate constant array eval works as expected", () => {
    const times = [1, 10, 50, 100];
    const y0 = [-1, -1, -1, -1, -1, -1];
    const y1 = [-2, -2, -2, -2, -2, -2];
    const y2 = [-3, -3, -3, -3, -3, -3];
    const y3 = [-4, -4, -4, -4, -4, -4];
    const y = [...y0, ...y1, ...y2, ...y3];
    const i = new interpolate.InterpolateConstantArray(times, y, dimUtils, nameT, nameY);
    
    expect(() => {
      i.eval(0)
    }).toThrow(
      "Tried to interpolate at time t = 0, which is before "
      + "first time (1)"
    );

    expect(i.eval(1)).toStrictEqual(y0);
    expect(i.eval(1.1)).toStrictEqual(y0);
    expect(i.eval(9.9)).toStrictEqual(y0);
    expect(i.eval(10)).toStrictEqual(y1);
    expect(i.eval(49.99)).toStrictEqual(y1);
    expect(i.eval(50)).toStrictEqual(y2);
    expect(i.eval(50.01)).toStrictEqual(y2);
    expect(i.eval(99.999)).toStrictEqual(y2);
    expect(i.eval(100)).toStrictEqual(y3);
    expect(i.eval(100.001)).toStrictEqual(y3);
    expect(i.eval(100_000)).toStrictEqual(y3);
  });
});
