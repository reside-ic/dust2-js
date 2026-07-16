import { Packer } from "../../Packer.ts";
import { array } from "./imports/array.ts";
import { math } from "./imports/math.ts";

export const imports = {
    Packer,
    math,
    array
};

export type Imports = typeof imports;
