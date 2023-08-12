import pkg from '@json-spec/core';
const { spec } = pkg;
const IDSpec = /^[0-9a-f]{32}$/;

export const SystemGenIDSpec = spec(val => IDSpec.test(val));
