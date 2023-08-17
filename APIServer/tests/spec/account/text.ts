import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { textSpec } from '../../../src/specs/account/text';
import assert from 'assert';
const { isValid } = pkg;

describe('Text Test', function () {
    it('valid', function () {
        assert.strictEqual(isValid(textSpec, 'あいうえお'), true);
        assert.strictEqual(isValid(textSpec, 'アイウエオ'), true);
        assert.strictEqual(isValid(textSpec, '亜伊宇衣於'), true);
        assert.strictEqual(isValid(textSpec, 'aiueo'), true);
        assert.strictEqual(isValid(textSpec, 'AIUEO'), true);
        assert.strictEqual(isValid(textSpec, '12345'), true);
    });
    it('invalid', function () {
        assert.strictEqual(isValid(textSpec, undefined), false);
        assert.strictEqual(isValid(textSpec, null), false);
        assert.strictEqual(isValid(textSpec, 0), false);
        assert.strictEqual(isValid(textSpec, ''), false);
        assert.strictEqual(isValid(textSpec, {}), false);
    });
});
