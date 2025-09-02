export const sirShared = [
    { N: 1000000, I0: 1, beta: 4, gamma: 2 },
    { N: 2000000, I0: 2, beta: 8, gamma: 4 }
];

export const expectedGroup1Initial = [
    999999, // shared.N - shared.I0;
    1, // shared.I0;
    0,
    0,
    0
];

export const expectedGroup2Initial = [
    1999998, // shared.N - shared.I0;
    2, // shared.I0;
    0,
    0,
    0
];
