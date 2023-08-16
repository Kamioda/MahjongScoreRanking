import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { idSpec } from '../../../src/specs/account/id';
import assert from 'assert';
const { isValid } = pkg;

describe('UserID Test', function () {
    it('valid', function () {
        assert.equal(isValid(idSpec, 'kamioda'), true);
        assert.equal(isValid(idSpec, 'KAMIODA'), true);
        assert.equal(isValid(idSpec, 'kamioda_ampsprg'), true);
        assert.equal(isValid(idSpec, 'KamiodaAmpsprg'), true);
        assert.equal(isValid(idSpec, 'Kamioda_Ampsprg'), true);
        assert.equal(isValid(idSpec, 'KAMIODA_AMPSPRG'), true);
    });
    it('invalid', function () {
        assert.equal(isValid(idSpec, 'kamioda-ampsprg'), false);
    });
});
