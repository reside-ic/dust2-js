import { describe, expect, test } from "vitest";
import { io } from "../src/interfaces/generators/imports/io";
import { DimUtils } from "../src/interfaces/generators/imports/array";

describe("io", () => {
    const dimUtils2d = { dim: [2, 3] } as DimUtils;
    const params = {
        a: 10.1,
        b: "b",
        c: null,
        d: undefined,
        e: -20.1,
        f: true,
        g: false,
        h: [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
    } as const;
    type Par = keyof typeof params;

    test("readReal works as expected", () => {
        const par: Par = "a";
        expect(io.readReal(params, par)).toBe(params[par]);
    });

    test("readReal throws if arg is not scalar", () => {
        const par: Par = "b";
        expect(() => {
            io.readReal(params, par);
        }).toThrow(`'${par}' must be a scalar`);
    });

    test("readReal throws if arg is nullish with no default", () => {
        let par: Par = "c";
        expect(() => {
            io.readReal(params, par);
        }).toThrow(`'${par}' must not be a missing value`);
        par = "d";
        expect(() => {
            io.readReal(params, par);
        }).toThrow(`'${par}' must not be a missing value`);
    });

    test("readReal returns default if arg is nullish", () => {
        const def = 1.1;
        let par: Par = "c";
        expect(io.readReal(params, par, def as any)).toBe(def);
        par = "d";
        expect(io.readReal(params, par, def as any)).toBe(def);
    });

    test("readInt rounds number", () => {
        const par: Par = "a";
        expect(io.readInt(params, par)).toBe(10);
    });

    test("readSize errors if number is negative", () => {
        const par: Par = "e";
        expect(() => {
            io.readSize(params, par);
        }).toThrow(`'${par}' must be non-negative`);
    });

    test("readBool works as expected", () => {
        let par: Par = "f";
        expect(io.readBool(params, par)).toBe(true);
        par = "g";
        expect(io.readBool(params, par)).toBe(false);
    });

    test("readBool throws if param is nullish with no default", () => {
        let par: Par = "c";
        expect(() => {
            io.readBool(params, par);
        }).toThrow(`'${par}' must not be a missing value`);
        par = "d";
        expect(() => {
            io.readBool(params, par);
        }).toThrow(`'${par}' must not be a missing value`);
    });

    test("readBool returns default if arg is nullish", () => {
        const def = false;
        let par: Par = "c";
        expect(io.readBool(params, par, def as any)).toBe(def);
        par = "d";
        expect(io.readBool(params, par, def as any)).toBe(def);
    });

    test("readRealArray works as expected", () => {
        const par: Par = "h";
        expect(io.readRealArray(params, par, dimUtils2d)).toStrictEqual(params[par]);
    });

    test("readRealArray throws if size isn't at least dim prod", () => {
        const par: Par = "h";
        expect(() => {
            io.readRealArray(params, par, { dim: [1, 2] } as DimUtils);
        }).toThrow(`Expected '${par}' to have size 2 but got 6`);
    });

    test("readIntArray works as expected", () => {
        const par: Par = "h";
        expect(io.readIntArray(params, par, dimUtils2d)).toStrictEqual(params[par].map(Math.round));
    });

    test("checkMinScalar works as expected", () => {
        const name = "foo";
        expect(() => {
            io.checkMinScalar(10.2, 5.1, name);
        }).not.toThrow();
        expect(() => {
            io.checkMinScalar(10.2, 10.3, name);
        }).toThrow(`'${name}' must be at least 10.3`);
    });

    test("checkMaxScalar works as expected", () => {
        const name = "foo";
        expect(() => {
            io.checkMaxScalar(10.2, 10.3, name);
        }).not.toThrow();
        expect(() => {
            io.checkMaxScalar(10.2, 5.1, name);
        }).toThrow(`'${name}' must be at most 5.1`);
    });

    test("checkMinArray works as expected", () => {
        const name = "foo";
        const arr = [10.1, 5.2];
        expect(() => {
            io.checkMinArray(arr, 5.1, name);
        }).not.toThrow();
        expect(() => {
            io.checkMinArray(arr, 5.3, name);
        }).toThrow(`All values of '${name}' must be at least 5.3`);
    });

    test("checkMaxArray works as expected", () => {
        const name = "foo";
        const arr = [10.1, 5.2];
        expect(() => {
            io.checkMaxArray(arr, 10.2, name);
        }).not.toThrow();
        expect(() => {
            io.checkMaxArray(arr, 5.3, name);
        }).toThrow(`All values of '${name}' must be at most 5.3`);
    });
});
