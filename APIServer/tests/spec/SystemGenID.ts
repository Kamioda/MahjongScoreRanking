import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { SystemGenIDSpec } from '../../src/specs/SystemGenID';
import assert from 'assert';
const { isValid } = pkg;

describe('System Generation ID Spec', function () {
    it('valid', function () {
        assert.strictEqual(isValid(SystemGenIDSpec, '1199056cafb34cd58195d4d10d1d994b'), true);
        assert.strictEqual(isValid(SystemGenIDSpec, '1199056CAFB34CD58195D4D10D1D994B'), true);
    });
    describe('invalid', function () {
        it('length', function () {
            assert.strictEqual(isValid(SystemGenIDSpec, '1199056cafb34cd58195d4d10d1d994'), false);
            assert.strictEqual(isValid(SystemGenIDSpec, '1199056CAFB34CD58195D4D10D1D994'), false);
            assert.strictEqual(isValid(SystemGenIDSpec, '1199056cafb34cd58195d4d10d1d994bc'), false);
            assert.strictEqual(isValid(SystemGenIDSpec, '1199056CAFB34CD58195D4D10D1D994Bc'), false);
        });
        it('format', function () {
            assert.strictEqual(isValid(SystemGenIDSpec, 'b43f7e00-fa9a-4148-852c-1d698c413073'), false);
            assert.strictEqual(isValid(SystemGenIDSpec, 'B43F7E00-FA9A-4148-852C-1D698C413073'), false);
        });
        it('invalid text', function () {
            assert.strictEqual(isValid(SystemGenIDSpec, '1199056cafb34cd58195d4d10g1d994b'), false);
            assert.strictEqual(isValid(SystemGenIDSpec, '1199056CAFB34CD58195D4D10G1D994B'), false);
        });
        it('id type', function () {
            assert.strictEqual(isValid(SystemGenIDSpec, 'kamioda'), false);
        });
    });
});
