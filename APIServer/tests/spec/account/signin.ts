import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import assert from 'assert';
import { signinSpec } from '../../../src/specs/account/signin';
const { isValid } = pkg;

const correctPattern = [
    {
        id: 'kamioda',
        password: 'password01',
    },
    {
        id: 'KAMIODA',
        password: 'password01',
    },
    {
        id: 'kamioda_ampsprg',
        password: 'password01',
    },
    {
        id: 'KamiodaAmpsprg',
        password: 'password01',
    },
    {
        id: 'Kamioda_Ampsprg',
        password: 'password01',
    },
    {
        id: 'KAMIODA_AMPSPRG',
        password: 'password01',
    },
];

const ngPattern = {
    idError: [
        {
            id: 'kamioda-ampsprg',
            password: 'password01',
        },
        {
            id: 0,
            password: 'password01',
        },
        {
            id: '',
            password: 'password01',
        },
        {
            id: null,
            password: 'password01',
        },
        {
            password: 'password01',
        },
    ],
    passwordError: [
        {
            id: 'kamioda_ampsprg',
            password: '',
        },
        {
            id: 'kamioda_ampsprg',
            password: null,
        },
        {
            id: 'kamioda_ampsprg',
        },
    ],
};

describe('SignIn Request Body Spec', function () {
    it('valid', function () {
        correctPattern.forEach(i => {
            assert.strictEqual(isValid(signinSpec, i), true);
        });
    });
    describe('invalid', function () {
        it('id', function () {
            ngPattern.idError.forEach(i => {
                assert.strictEqual(isValid(signinSpec, i), false);
            });
        });
        it('password', function () {
            ngPattern.passwordError.forEach(i => {
                assert.strictEqual(isValid(signinSpec, i), false);
            });
        });
    });
});
