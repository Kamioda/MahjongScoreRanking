import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { idSpec } from '../../../src/specs/account/id';
import assert from 'assert';
const { isValid } = pkg;

describe('UserID Test', function () {
    it('valid', function () {
        assert.strictEqual(isValid(idSpec, 'kamioda'), true);
        assert.strictEqual(isValid(idSpec, 'KAMIODA'), true);
        assert.strictEqual(isValid(idSpec, 'kamioda_ampsprg'), true);
        assert.strictEqual(isValid(idSpec, 'KamiodaAmpsprg'), true);
        assert.strictEqual(isValid(idSpec, 'Kamioda_Ampsprg'), true);
        assert.strictEqual(isValid(idSpec, 'KAMIODA_AMPSPRG'), true);
    });
    it('invalid', function () {
        assert.strictEqual(isValid(idSpec, 'kamioda-ampsprg'), false);
    });
});
