import { describe, test, expect } from "vitest";
import { SystemSimulateResult } from "../src/SystemSimulateResult";

describe("SystenSimulateResult", () => {
    test("can get values for time", () => {
        const sut = new SystemSimulateResult(2, 3, 4, 2);

        sut.setValuesForTime(0, 0, 0, [1, 2, 3, 4]);
        sut.setValuesForTime(1, 2, 1, [9, 8, 7, 6]);
        
        const t0Vals = sut.getValuesForTime(0, 0, 0);
        expect(t0Vals.size).toBe(4);
        expect(t0Vals.get(0)).toBe(1);
        expect(t0Vals.get(1)).toBe(2);
        expect(t0Vals.get(2)).toBe(3);
        expect(t0Vals.get(3)).toBe(4);

        const t1Vals = sut.getValuesForTime(1, 2, 1);
        expect(t1Vals.size).toBe(4);
        expect(t1Vals.get(0)).toBe(9);
        expect(t1Vals.get(1)).toBe(8);
        expect(t1Vals.get(2)).toBe(7);
        expect(t1Vals.get(3)).toBe(6);
    });

    test("can get state element values", () => {
        const sut = new SystemSimulateResult(2, 2, 4, 2);
        sut.setValuesForTime(0, 0, 0, [100, 200, 300, 400]);
        sut.setValuesForTime(0, 1, 0, [101, 201, 301, 401]);
        sut.setValuesForTime(0, 0, 1, [900, 800, 700, 600]);
        sut.setValuesForTime(0, 1, 1, [901, 801, 701, 601]);

        const p0s0Vals = sut.getStateElement(0, 0, 0);
        expect(p0s0Vals.size).toBe(2);
        expect(p0s0Vals.get(0)).toBe(100);
        expect(p0s0Vals.get(1)).toBe(900);
        const p0s1Vals = sut.getStateElement(0, 0, 1);
        expect(p0s1Vals.size).toBe(2);
        expect(p0s1Vals.get(0)).toBe(200);
        expect(p0s1Vals.get(1)).toBe(800);
        const p0s2Vals = sut.getStateElement(0, 0, 2);
        expect(p0s2Vals.size).toBe(2);
        expect(p0s2Vals.get(0)).toBe(300);
        expect(p0s2Vals.get(1)).toBe(700);
        const p0s3Vals = sut.getStateElement(0, 0, 3);
        expect(p0s3Vals.size).toBe(2);
        expect(p0s3Vals.get(0)).toBe(400);
        expect(p0s3Vals.get(1)).toBe(600);

        const p1s0Vals = sut.getStateElement(0, 1, 0);
        expect(p1s0Vals.size).toBe(2);
        expect(p1s0Vals.get(0)).toBe(101);
        expect(p1s0Vals.get(1)).toBe(901);
        const p1s1Vals = sut.getStateElement(0, 1, 1);
        expect(p1s1Vals.size).toBe(2);
        expect(p1s1Vals.get(0)).toBe(201);
        expect(p1s1Vals.get(1)).toBe(801);
        const p1s2Vals = sut.getStateElement(0, 1, 2);
        expect(p1s2Vals.size).toBe(2);
        expect(p1s2Vals.get(0)).toBe(301);
        expect(p1s2Vals.get(1)).toBe(701);
        const p1s3Vals = sut.getStateElement(0, 1, 3);
        expect(p1s3Vals.size).toBe(2);
        expect(p1s3Vals.get(0)).toBe(401);
        expect(p1s3Vals.get(1)).toBe(601);
    });
});