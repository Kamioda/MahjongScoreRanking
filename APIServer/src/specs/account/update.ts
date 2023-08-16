import pkg from '@json-spec/core';
import { idSpec } from './id';
import { textSpec } from './text';
const { object, spec, isValid } = pkg;

const updateAccountSpecBase = object({
    optional: {
        id: idSpec,
        name: textSpec,
    },
});

export const updateAccountSpec = spec(data => {
    if (data == null || Object.keys(data).length === 0) return false;
    return isValid(updateAccountSpecBase, data);
});
