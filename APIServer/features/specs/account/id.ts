import pkg from '@json-spec/core';
const { spec } = pkg;
const IDReg = /^[0-9a-zA-Z_]{5,}$/;

export const idSpec = spec(val => IDReg.test(val));
