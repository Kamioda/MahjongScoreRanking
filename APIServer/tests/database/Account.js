import AccountManager from '../../features/Account.js';
import assert from 'assert';
import * as sinon from 'sinon';
import { expect } from 'expect';

class AccountManagerForTest {
    constructor(AccountManagerInstance) {
        /**
         * @type {AccountManager}
         */
        this.AMI = AccountManagerInstance;
    }
    async AddNewAccount(PreID, Name, Level) {
        return await this.AMI.AddNewAccount(PreID, Name, Level);
    }
    async ChangePassword(ID, NewPassword) {
        return await this.AMI.ChangePassword(ID, NewPassword);
    }
    async ChangeUserInfo(ID, NewRecord) {
        return await this.AMI.ChangeUserInfo(ID, NewRecord);
    }
    async ChangePrivilege(ID, NewPriv) {
        return await this.AMI.ChangePrivilege(ID, NewPriv);
    }
    async GetAccountInfo(ID) {
        return await this.AMI.GetAccountInfo(ID);
    }
    async SignIn(ID, Password) {
        return await this.AMI.SignIn(ID, Password);
    }
    async DeleteUser(ID) {
        return await this.AMI.DeleteUser(ID);
    }
    async GetAccountCount() {
        return await this.AMI.GetAccountCount();
    }
    async GetAllAccount() {
        return this.AMI.Client.accounts
            .findMany({
                select: {
                    ID: true,
                    UserID: true,
                    UserName: true,
                    AccountLevel: true,
                },
            })
            .then(record =>
                record.map(r => ({ sysid: r.ID, id: r.UserID, name: r.UserName, privilege: r.AccountLevel }))
            );
    }
    async DeleteAllAccount() {
        this.AMI.Client.accounts.deleteMany();
    }
}

describe('Account Manager Test', function () {
    const PrePasswordForTest = 'password01';
    describe('create pre password', function () {
        it('test/default', function () {
            const AccountMgr = new AccountManager();
            assert.match(AccountMgr.createPrePassword(), /^[0-9a-zA-Z]{8}$/);
        });
        it('test/custom', function () {
            const AccountMgr = new AccountManager(15);
            assert.match(AccountMgr.createPrePassword(), /^[0-9a-zA-Z]{15}$/);
        });
    });
    describe('add', function () {
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        let stubCreatePrePassword = null;
        before(function () {
            stubCreatePrePassword = sinon.stub(AccountMgr.AMI, 'createPrePassword').callsFake(len => {
                expect(len).toBeGreaterThan(1);
                return PrePasswordForTest;
            });
        });
        after(function () {
            AccountMgr.DeleteAllAccount();
            if (stubCreatePrePassword && stubCreatePrePassword.restore) stubCreatePrePassword.restore();
        });
        it('test/admin', function () {
            const expected = {
                id: 'kamioda_ampsprg',
                password: PrePasswordForTest,
            };
            AccountMgr.AddNewAccount('kamioda_ampsprg', '神御田', 0).then(data => {
                assert.deepEqual(data, expected);
            });
        });
        it('test/user', function () {
            const expected = {
                id: 'ayaka_meigetsu',
                password: PrePasswordForTest,
            };
            AccountMgr.AddNewAccount('ayaka_meigetsu', '明月彩香', 1).then(data => {
                assert.deepEqual(data, expected);
            });
        });
    });
    describe('create id', function() {
        const TestID = '50a16faf10b048798cc92ca73861d7ea';
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        const TestAccount = {
            id: 'kamioda_ampsprg',
            name: '神御田',
            privilege: 0,
        };
        before(function () {
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege);
            if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
        });
        after(function () {
            AccountMgr.DeleteAllAccount();
        });
        it('test', function() {
            AccountMgr.AMI.createId().then(id => {
                assert.notEqual(id, TestID);
            });
        });
    });
    describe('get user', function () {
        const TestID = '50a16faf10b048798cc92ca73861d7ea';
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        const TestAccount = {
            id: 'mirai_amairo',
            name: '飯島みらい',
            privilege: 1,
        };
        let stubCreateId = null;
        before(function () {
            stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege);
        });
        after(function () {
            if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
            AccountMgr.DeleteAllAccount();
        });
        it('test', function () {
            AccountMgr.GetAccountInfo(TestID).then(i => {
                assert.deepEqual(i, TestAccount);
            });
        });
    });
});
