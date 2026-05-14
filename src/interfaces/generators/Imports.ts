import { poissonLogDensity } from "../../density.ts";
import { Packer } from "../../Packer.ts";

const math = {
    poissonLogDensity
};

export const imports = {
    Packer,
    math
};

export type Imports = typeof imports;
