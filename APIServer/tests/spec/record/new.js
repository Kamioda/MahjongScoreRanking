import pkg from '@json-spec/core';
import { newRecordSpec } from '../../../features/specs/record/new.js';
import assert from 'assert';
const { isValid } = pkg;

const correctPattern = [
    {
        kamioda: 25000,
        KAMIODA: 25000,
        kamioda_ampsprg: 25000,
        KamiodaAmpsprg: 25000,
    },
    {
        kamioda_ampsprg: 25000,
        KamiodaAmpsprg: 25000,
        Kamioda_Ampsprg: 25000,
    },
    {
        Kamioda_Ampsprg: 25000,
        KAMIODA_AMPSPRG: 25000,
    },
];

const ngPattern = {
    overPlayer: {
        kamioda: 25000,
        KAMIODA: 25000,
        kamioda_ampsprg: 25000,
        KamiodaAmpsprg: 25000,
        Kamioda_Ampsprg: 25000,
    },
    noFriend: {
        KAMIODA_AMPSPRG: 25000,
    },
    empty: {},
    notObject: 25000,
    invalidId: {
        kamioda: 25000,
        KAMIODA: 25000,
        kamioda$ampsprg: 25000,
        KamiodaAmpsprg: 25000,
    }
};

describe('New Record Add Request Body', function () {
    it('valid', function () {
        correctPattern.forEach(i => {
            assert.equal(isValid(newRecordSpec, i), true);
        });
    });
    describe('invalid', function () {
        it('over player', function () {
            assert.equal(isValid(newRecordSpec, ngPattern.overPlayer), false);
        });
        it('no friend', function () {
            assert.equal(isValid(newRecordSpec, ngPattern.noFriend), false);
        });
        it('empty', function () {
            assert.equal(isValid(newRecordSpec, ngPattern.empty), false);
        });
        it('not object', function() {
            assert.equal(isValid(newRecordSpec, ngPattern.notObject), false);
        });
        it('invalid id', function() {
            assert.equal(isValid(newRecordSpec, ngPattern.invalidId), false);
        });
    });
});
