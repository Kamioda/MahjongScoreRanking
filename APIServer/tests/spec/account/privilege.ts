import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { privilegeSpec } from '../../../src/specs/account/privilege';
import assert from 'assert';
const { isValid } = pkg;

describe('Privilege Test', function () {
    it('valid', function () {
        assert.equal(isValid(privilegeSpec, 0), true);
        assert.equal(isValid(privilegeSpec, 1), true);
    });
    it('invalid', function () {
        assert.equal(isValid(privilegeSpec, 2), false);
        assert.equal(isValid(privilegeSpec, '0'), false);
        assert.equal(isValid(privilegeSpec, '1'), false);
        assert.equal(isValid(privilegeSpec, 'administrator'), false);
        assert.equal(isValid(privilegeSpec, 'user'), false);
    });
});
