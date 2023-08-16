import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { textSpec } from '../../../src/specs/account/text';
import assert from 'assert';
const { isValid } = pkg;

describe('Text Test', function () {
    it('valid', function () {
        assert.equal(isValid(textSpec, 'あいうえお'), true);
        assert.equal(isValid(textSpec, 'アイウエオ'), true);
        assert.equal(isValid(textSpec, '亜伊宇衣於'), true);
        assert.equal(isValid(textSpec, 'aiueo'), true);
        assert.equal(isValid(textSpec, 'AIUEO'), true);
        assert.equal(isValid(textSpec, '12345'), true);
    });
    it('invalid', function () {
        assert.equal(isValid(textSpec, undefined), false);
        assert.equal(isValid(textSpec, null), false);
        assert.equal(isValid(textSpec, 0), false);
        assert.equal(isValid(textSpec, ''), false);
        assert.equal(isValid(textSpec, {}), false);
    });
});
