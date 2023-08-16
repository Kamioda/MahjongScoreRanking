import pkg from '@json-spec/core';
import { idSpec } from './id.js';
import { textSpec } from './text.js';
const { object } = pkg;

export const signinSpec = object({
    required: {
        id: idSpec,
        password: textSpec,
    },
});
