import AccountManager from '../../features/Account.js';
import assert from 'assert';
import * as sinon from 'sinon';
import { expect } from 'expect';
import { readFileSync } from 'fs';

const ReadMultiAccountFile = () => {
    return JSON.parse(readFileSync('./testaccounts.json', 'utf-8'));
};

const createRandom = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

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
    describe('create id', function () {
        describe('use mock', function () {
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
            it('test', function () {
                AccountMgr.AMI.createId().then(id => {
                    assert.notEqual(id, TestID);
                });
            });
        });
        describe('not use mock', function () {
            const AccountMgr = new AccountManagerForTest(new AccountManager());
            const TestAccount = {
                id: 'kamioda_ampsprg',
                name: '神御田',
                privilege: 0,
            };
            let TestUserID = '';
            before(function () {
                AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege);
                AccountMgr.GetAllAccount().then(records => {
                    TestUserID = records[0].sysid;
                });
            });
            after(function () {
                AccountMgr.DeleteAllAccount();
            });
            it('test', function () {
                AccountMgr.AMI.createId().then(id => {
                    assert.notEqual(id, TestUserID);
                });
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
        before(function () {
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege);
            if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
        });
        after(function () {
            AccountMgr.DeleteAllAccount();
        });
        it('test', function () {
            AccountMgr.GetAccountInfo(TestID).then(i => {
                assert.deepEqual(i, TestAccount);
            });
        });
    });
    describe('sign in', function () {
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        let AccountCount = 0;
        before(function () {
            const stubCreatePrePassword = sinon
                .stub(AccountMgr.AMI, 'createPrePassword')
                .callsFake(() => PrePasswordForTest);
            const Accounts = ReadMultiAccountFile();
            AccountCount = Accounts.users.length;
            Accounts.users.forEach(i => {
                AccountMgr.AddNewAccount(i.id, i.name, i.privilege);
            });
            if (stubCreatePrePassword && stubCreatePrePassword.restore) stubCreatePrePassword.restore();
        });
        after(function () {
            AccountMgr.DeleteAllAccount();
        });
        it('valid', function () {
            AccountMgr.GetAllAccount().then(records => {
                const Index = createRandom(0, AccountCount - 1);
                AccountMgr.SignIn(records[Index].id, PrePasswordForTest)
                    .then(id => {
                        assert.equal(id, records[Index].sysid);
                    })
                    .catch(() => {
                        assert.fail();
                    });
            });
        });
        it('invalid', function () {
            AccountMgr.GetAllAccount().then(records => {
                const Index = createRandom(0, AccountCount - 1);
                AccountMgr.SignIn(records[Index].id, 'passwordfail01')
                    .then(() => {
                        assert.fail();
                    })
                    .catch(() => {
                        assert.ok();
                    });
            });
        });
    });
    describe('delete user', function () {
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        let AccountCount = 0;
        before(function () {
            const Accounts = ReadMultiAccountFile();
            AccountCount = Accounts.users.length;
            Accounts.users.forEach(i => {
                AccountMgr.AddNewAccount(i.id, i.name, i.privilege);
            });
        });
        after(function () {
            AccountMgr.DeleteAllAccount();
        });
        it('test', function () {
            AccountMgr.GetAllAccount().then(records => {
                const Index = createRandom(0, AccountCount - 1);
                const deleteTargetId = records[Index].sysid;
                records.splice(Index, 1);
                AccountMgr.DeleteUser(deleteTargetId)
                    .then(() => AccountMgr.GetAllAccount())
                    .then(recordsAfter => {
                        for (let i = 0; i < records.length - 1; i++) {
                            assert.deepEqual(recordsAfter[i], records[i]);
                        }
                    });
            });
        });
    });
    describe('get account count', function () {
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        let CorrectAccountCount = 0;
        before(function () {
            const Accounts = ReadMultiAccountFile();
            CorrectAccountCount = Accounts.users.length;
            Accounts.users.forEach(i => {
                AccountMgr.AddNewAccount(i.id, i.name, i.privilege);
            });
        });
        after(function () {
            AccountMgr.DeleteAllAccount();
        });
        it('test', function () {
            AccountMgr.GetAccountCount().then(count => {
                assert.equal(count, CorrectAccountCount);
            });
        });
    });
    describe('change password', function () {
        const TestAccount = {
            id: 'amairo_miyuki',
            name: '愛野みゆき',
            privilege: 1,
        };
        const TestID = '50a16faf10b048798cc92ca73861d7ea';
        const NewPassword = 'passwordnew001';
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        before(function () {
            const stubCreatePrePassword = sinon
                .stub(AccountMgr.AMI, 'createPrePassword')
                .callsFake(() => PrePasswordForTest);
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege);
            if (stubCreatePrePassword && stubCreatePrePassword.restore) stubCreatePrePassword.restore();
            if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
        });
        after(function () {
            AccountMgr.DeleteAllAccount();
        });
        it('test', function () {
            AccountMgr.SignIn(TestAccount, PrePasswordForTest)
                .then(id => {
                    assert.equal(id, TestID);
                })
                .catch(() => {
                    assert.ok();
                });
            AccountMgr.SignIn(TestAccount, NewPassword)
                .then(() => {
                    assert.fail();
                })
                .catch(() => {
                    assert.ok();
                });
            AccountMgr.ChangePassword(TestID, NewPassword).then(() => {
                AccountMgr.SignIn(TestAccount, NewPassword)
                    .then(id => {
                        assert.equal(id, TestID);
                    })
                    .catch(() => {
                        assert.ok();
                    });
                AccountMgr.SignIn(TestAccount, PrePasswordForTest)
                    .then(() => {
                        assert.fail();
                    })
                    .catch(() => {
                        assert.ok();
                    });
            });
        });
    });
    describe('change privilege', function () {
        const TestID = 'b20046fe0ca7480292a0b27e1426f5e8';
        const TestAccount = {
            id: 'mizuki_otokoe',
            name: '木下瑞希',
            privilege: 1,
        };
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        before(function () {
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege);
            if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
        });
        after(function () {
            AccountMgr.DeleteAllAccount();
        });
        it('test', function () {
            AccountMgr.ChangePrivilege(TestID, 0)
                .then(() => AccountMgr.GetAccountInfo(TestID))
                .then(record => {
                    assert.equal(record.privilege, 0);
                })
                .catch(() => {
                    assert.fail();
                });
        });
    });
});
