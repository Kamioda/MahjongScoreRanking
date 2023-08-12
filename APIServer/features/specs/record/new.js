import pkg from '@json-spec/core';
import { idSpec } from '../account/id';
const { spec, isValid } = pkg;

export const newRecordSpec = spec(data => {
    if (typeof data !== 'object') return false;
    return Object.keys(data).every(i => {
        if (!isValid(idSpec, i)) return false;
        return typeof data[i] === 'number';
    });
});
