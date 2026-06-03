// import { lngamma } from "ieee745gamma";

export const poissonLogDensity = (x: number, lambda: number) => x * Math.log(lambda) - lambda - (x + 1);
