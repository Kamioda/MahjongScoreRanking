import { describe, it } from 'mocha';
import { HashPassword, IsNullOrWhiteSpace } from '../../src/Account';
import assert from 'assert';

describe('Account submodule test', function () {
    describe('Hash password test', function () {
        it('test', function () {
            assert.strictEqual(
                HashPassword('password01'),
                'e0638591f28a1a0da8308f9a8413d34b6b6568dc6db1e3d952dfba0fcdd0452216473232c78441ab5c4812e602a5a294adc4275416e2666fe43081009547e4c6'
            );
        });
    });

    describe('IsNullOrWhiteSpace test', function () {
        it('true', function () {
            assert.strictEqual(IsNullOrWhiteSpace(null), true);
            assert.strictEqual(IsNullOrWhiteSpace(undefined), true);
            assert.strictEqual(IsNullOrWhiteSpace(''), true);
            assert.strictEqual(IsNullOrWhiteSpace(' '), true);
            assert.strictEqual(IsNullOrWhiteSpace('  '), true);
        });
        it('false', function () {
            assert.strictEqual(IsNullOrWhiteSpace('あ'), false);
        });
    });
});
