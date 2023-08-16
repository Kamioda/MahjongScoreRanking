import pkg from '@json-spec/core';
import { idSpec } from '../account/id';
const { spec, isValid } = pkg;

export const newRecordSpec = spec(data => {
    if (typeof data !== 'object') return false;
    const keys = Object.keys(data);
    if (keys.length < 2 || keys.length > 4) return false;
    return keys.every(i => {
        if (!isValid(idSpec, i)) return false;
        return typeof data[i] === 'number';
    });
});
