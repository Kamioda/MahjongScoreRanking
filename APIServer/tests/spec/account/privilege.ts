import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { privilegeSpec } from '../../../src/specs/account/privilege';
import assert from 'assert';
const { isValid } = pkg;

describe('Privilege Test', function () {
    it('valid', function () {
        assert.strictEqual(isValid(privilegeSpec, 0), true);
        assert.strictEqual(isValid(privilegeSpec, 1), true);
    });
    it('invalid', function () {
        assert.strictEqual(isValid(privilegeSpec, 2), false);
        assert.strictEqual(isValid(privilegeSpec, '0'), false);
        assert.strictEqual(isValid(privilegeSpec, '1'), false);
        assert.strictEqual(isValid(privilegeSpec, 'administrator'), false);
        assert.strictEqual(isValid(privilegeSpec, 'user'), false);
    });
});
