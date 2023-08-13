import AccountManager from '../../features/Account.js';
import { PrismaClient } from '@prisma/client';
import assert from 'assert';

describe('Account Manager Test', function () {
    const AccountMgr = new AccountManager();
    const Client = new PrismaClient();
    describe('add', function () {
        after(async function () {
            await Client.accounts.deleteMany();
        });
        it('test', async function () {
            await AccountMgr.AddNewAccount('kamioda_ampsprg', '神御田', 0).then(data => {
                assert.equal(data.id, 'kamioda_ampsprg');
                assert.equal(data.password.length, 8);
            });
            await AccountMgr.AddNewAccount('ayaka_meigetsu', '明月彩香', 1).then(data => {
                assert.equal(data.id, 'ayaka_meigetsu');
                assert.equal(data.password.length, 8);
            });
        });
    });
});
