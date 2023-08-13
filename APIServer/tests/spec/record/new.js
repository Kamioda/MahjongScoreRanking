import pkg from '@json-spec/core';
import { newRecordSpec } from '../../../features/specs/record/new.js';
import assert from 'assert';
const { isValid } = pkg;

const correctPattern = {
    kamioda: 25000,
    KAMIODA: 25000,
    kamioda_ampsprg: 25000,
    KamiodaAmpsprg: 25000
};

describe('New Record Add Request Body', function() {
    it('valid', function() {
        assert.equal(isValid(newRecordSpec, correctPattern), true);
    });
}); 
