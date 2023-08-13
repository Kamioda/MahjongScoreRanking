import { HashPassword } from "../../features/Account.js";
import assert from 'assert';

describe('Hash password test', function() {
    it('test', function() {
        assert.equal(HashPassword('password01'), 'e0638591f28a1a0da8308f9a8413d34b6b6568dc6db1e3d952dfba0fcdd0452216473232c78441ab5c4812e602a5a294adc4275416e2666fe43081009547e4c6');
    });
})