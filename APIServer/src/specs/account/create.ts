import pkg from '@json-spec/core';
import { idSpec } from './id';
import { textSpec } from './text';
import { privilegeSpec } from './privilege';
const { object } = pkg;

export const createAccountSpec = object({
    required: {
        id: idSpec,
        name: textSpec,
        privilege: privilegeSpec,
    },
});
