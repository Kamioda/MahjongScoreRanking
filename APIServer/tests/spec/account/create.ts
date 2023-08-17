import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { createAccountSpec } from '../../../src/specs/account/create';
import assert from 'assert';
const { isValid } = pkg;

const correctPattern = {
    id: 'kamioda_ampsprg',
    name: '神御田＠Windowsゲームプログラマー',
    privilege: 0,
};

const ngPattern = {
    idError: [
        {
            id: 'kamioda-ampsprg',
            name: '神御田＠Windowsゲームプログラマー',
            privilege: 0,
        },
        {
            id: '',
            name: '神御田＠Windowsゲームプログラマー',
            privilege: 0,
        },
        {
            id: 0,
            name: '神御田＠Windowsゲームプログラマー',
            privilege: 0,
        },
        {
            id: null,
            name: '神御田＠Windowsゲームプログラマー',
            privilege: 0,
        },
        {
            name: '神御田＠Windowsゲームプログラマー',
            privilege: 0,
        },
    ],
    nameError: [
        {
            id: 'kamioda_ampsprg',
            name: '',
            privilege: 0,
        },
        {
            id: 'kamioda_ampsprg',
            name: 0,
            privilege: 0,
        },
        {
            id: 'kamioda_ampsprg',
            name: null,
            privilege: 0,
        },
        {
            id: 'kamioda_ampsprg',
            privilege: 0,
        },
    ],
    privilegeError: [
        {
            id: 'kamioda_ampsprg',
            name: '神御田＠Windowsゲームプログラマー',
            privilege: 2,
        },
        {
            id: 'kamioda_ampsprg',
            name: '神御田＠Windowsゲームプログラマー',
            privilege: '0',
        },
        {
            id: 'kamioda_ampsprg',
            name: '神御田＠Windowsゲームプログラマー',
            privilege: null,
        },
        {
            id: 'kamioda_ampsprg',
            name: '神御田＠Windowsゲームプログラマー',
        },
    ],
};

describe('Create Account Request Body Spec', function () {
    it('valid', function () {
        assert.strictEqual(isValid(createAccountSpec, correctPattern), true);
    });
    describe('invalid', function () {
        it('id', function () {
            ngPattern.idError.forEach(i => {
                assert.strictEqual(isValid(createAccountSpec, i), false);
            });
        });
        it('name', function () {
            ngPattern.nameError.forEach(i => {
                assert.strictEqual(isValid(createAccountSpec, i), false);
            });
        });
        it('privilege', function () {
            ngPattern.privilegeError.forEach(i => {
                assert.strictEqual(isValid(createAccountSpec, i), false);
            });
        });
    });
});
