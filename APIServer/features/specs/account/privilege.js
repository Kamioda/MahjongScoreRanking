import pkg from '@json-spec/core';
const { spec } = pkg;

export const privilegeSpec = spec(val => val === 0 || val === 1);
