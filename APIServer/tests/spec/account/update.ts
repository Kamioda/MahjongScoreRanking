import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { updateAccountSpec } from '../../../src/specs/account/update';
import assert from 'assert';
const { isValid } = pkg;

const correctPattern = [
    {
        id: 'kamioda_ampsprg',
        name: '神御田＠Windowsゲームプログラマー',
    },
    {
        id: 'kamioda_ampsprg',
    },
    {
        name: '神御田＠Windowsゲームプログラマー',
    },
];

const ngPattern = {
    idError: [
        {
            id: 'kamioda-ampsprg',
            name: '神御田＠Windowsゲームプログラマー',
        },
        {
            id: 'kamioda-ampsprg',
        },
        {
            id: '',
            name: '神御田＠Windowsゲームプログラマー',
        },
        {
            id: '',
        },
        {
            id: 0,
            name: '神御田＠Windowsゲームプログラマー',
        },
        {
            id: 0,
        },
        {
            id: null,
            name: '神御田＠Windowsゲームプログラマー',
        },
        {
            id: null,
        },
    ],
    nameError: [
        {
            id: 'kamioda_ampsprg',
            name: '',
        },
        {
            name: '',
        },
        {
            id: 'kamioda_ampsprg',
            name: 0,
        },
        {
            name: 0,
        },
        {
            id: 'kamioda_ampsprg',
            name: null,
        },
        {
            name: null,
        },
    ],
};

describe('Update Account Request Body Spec', function () {
    it('valid', function () {
        correctPattern.forEach(i => {
            assert.strictEqual(isValid(updateAccountSpec, i), true);
        });
    });
    describe('invalid', function () {
        it('id', function () {
            ngPattern.idError.forEach(i => {
                assert.strictEqual(isValid(updateAccountSpec, i), false);
            });
        });
        it('name', function () {
            ngPattern.nameError.forEach(i => {
                assert.strictEqual(isValid(updateAccountSpec, i), false);
            });
        });
        it('null or empty', function () {
            assert.strictEqual(isValid(updateAccountSpec, {}), false);
            assert.strictEqual(isValid(updateAccountSpec, null), false);
            assert.strictEqual(isValid(updateAccountSpec, undefined), false);
        });
    });
});
