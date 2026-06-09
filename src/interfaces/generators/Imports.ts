import { Packer } from "../../Packer.ts";
import { array } from "./imports/array.ts";
import { interpolate } from "./imports/interpolate.ts";
import { math } from "./imports/math.ts";

export const imports = {
    Packer,
    math,
    array,
    interpolate,
};

export type Imports = typeof imports;
