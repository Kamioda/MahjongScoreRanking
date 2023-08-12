import pkg from '@json-spec/core';
const { spec } = pkg;

export const textSpec = spec(val => val.length > 0);
