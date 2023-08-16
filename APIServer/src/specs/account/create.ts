import pkg from '@json-spec/core';
import { idSpec } from './id.js';
import { textSpec } from './text.js';
import { privilegeSpec } from './privilege.js';
const { object } = pkg;

export const createAccountSpec = object({
    required: {
        id: idSpec,
        name: textSpec,
        privilege: privilegeSpec,
    },
});
