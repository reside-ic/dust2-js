import { Packer } from "../../Packer.ts";
import { array } from "./imports/array.ts";
import { interpolate } from "./imports/interpolate.ts";
import { io } from "./imports/io.ts";
import { math } from "./imports/math.ts";


export const imports = {
    Packer,
    math,
    array,
    interpolate,
    io,
};

export type Imports = typeof imports;
