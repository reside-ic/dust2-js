import { describe, expect, test } from "vitest";
import { prod } from "../src/utils";

describe("prod", () => {
    test("returns product of all elements in array", () => {
        expect(prod([2, 3, 7])).toBe(42);
    });

    test("returns 1 for empty array", () => {
        expect(prod([])).toBe(1);
    });
});

// TODO: test shape slice