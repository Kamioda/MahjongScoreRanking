import pkg from '@json-spec/core';
const { spec } = pkg;

export const textSpec = spec(val => typeof val === 'string' && val.length > 0);
