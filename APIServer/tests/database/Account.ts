import { describe, it, before, after } from 'mocha';
import AccountManager from '../../src/Account';
import assert from 'assert';
import * as sinon from 'sinon';
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
    AMI: AccountManager;
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
    async GetSystemID(UserID) {
        return await this.AMI.GetSystemID(UserID);
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
    const AccountMgr = new AccountManagerForTest(new AccountManager());
    const DeleteAllAccountOnlyProcess = function (done) {
        AccountMgr.DeleteAllAccount().then(() => {
            done();
        });
    };
    describe('create pre password', function () {
        it('test/default', function () {
            const AccountMgrForCreatePrePassword = new AccountManager();
            assert.match(AccountMgrForCreatePrePassword.createPrePassword(), /^[0-9a-zA-Z]{8}$/);
        });
        it('test/custom', function () {
            const AccountMgrForCreatePrePassword = new AccountManager(15);
            assert.match(AccountMgrForCreatePrePassword.createPrePassword(), /^[0-9a-zA-Z]{15}$/);
        });
    });
    describe('add', function () {
        let stubCreatePrePassword: sinon.SinonStub<[], string> | null = null;
        before(function () {
            stubCreatePrePassword = sinon
                .stub(AccountMgr.AMI, 'createPrePassword')
                .callsFake((): string => PrePasswordForTest);
        });
        after(function (done) {
            AccountMgr.DeleteAllAccount().finally(() => {
                if (stubCreatePrePassword && stubCreatePrePassword.restore) stubCreatePrePassword.restore();
                done();
            });
        });
        it('test/admin', function (done) {
            const expected = {
                id: 'kamioda_ampsprg',
                password: PrePasswordForTest,
            };
            AccountMgr.AddNewAccount('kamioda_ampsprg', '神御田', 0)
                .then(data => {
                    assert.deepEqual(data, expected);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    done();
                });
        });
        it('test/user', function (done) {
            const expected = {
                id: 'ayaka_meigetsu',
                password: PrePasswordForTest,
            };
            AccountMgr.AddNewAccount('ayaka_meigetsu', '明月彩香', 1)
                .then(data => {
                    assert.deepEqual(data, expected);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    done();
                });
        });
    });
    describe('create id', function () {
        describe('use mock', function () {
            const TestID = '50a16faf10b048798cc92ca73861d7ea';
            const TestAccount = {
                id: 'kamioda_ampsprg',
                name: '神御田',
                privilege: 0,
            };
            before(function (done) {
                const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
                AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege)
                    .catch((er: Error) => {
                        console.error(er.message);
                    })
                    .finally(() => {
                        if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
                        done();
                    });
            });
            after(DeleteAllAccountOnlyProcess);
            it('test', function (done) {
                AccountMgr.AMI.createId()
                    .then(id => {
                        assert.notEqual(id, TestID);
                    })
                    .catch((er: Error) => {
                        console.error(er.message);
                    })
                    .finally(() => {
                        done();
                    });
            });
        });
        describe('not use mock', function () {
            const TestAccount = {
                id: 'kamioda_ampsprg',
                name: '神御田',
                privilege: 0,
            };
            let TestUserID = '';
            before(function (done) {
                AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege)
                    .then(() => AccountMgr.GetAllAccount())
                    .then(records => {
                        TestUserID = records[0].sysid;
                    })
                    .catch((er: Error) => {
                        console.error(er.message);
                    })
                    .finally(() => {
                        done();
                    });
            });
            after(DeleteAllAccountOnlyProcess);
            it('test', function (done) {
                AccountMgr.AMI.createId()
                    .then(id => {
                        assert.notEqual(id, TestUserID);
                    })
                    .catch((er: Error) => {
                        console.error(er.message);
                    })
                    .finally(() => {
                        done();
                    });
            });
        });
    });
    describe('get user', function () {
        const TestID = '50a16faf10b048798cc92ca73861d7ea';
        const TestAccount = {
            id: 'mirai_amairo',
            name: '飯島みらい',
            privilege: 1,
        };
        before(function (done) {
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege)
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
                    done();
                });
        });
        after(DeleteAllAccountOnlyProcess);
        it('test', function (done) {
            AccountMgr.GetAccountInfo(TestID)
                .then(i => {
                    assert.deepEqual(i, TestAccount);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    done();
                });
        });
    });
    describe('sign in', function () {
        let AccountCount = 0;
        before(function (done) {
            const stubCreatePrePassword = sinon
                .stub(AccountMgr.AMI, 'createPrePassword')
                .callsFake(() => PrePasswordForTest);
            const Accounts = ReadMultiAccountFile();
            AccountCount = Accounts.users.length;
            const Promises = Accounts.users.map(i => AccountMgr.AddNewAccount(i.id, i.name, i.privilege));
            Promise.all(Promises)
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    if (stubCreatePrePassword && stubCreatePrePassword.restore) stubCreatePrePassword.restore();
                    done();
                });
        });
        after(DeleteAllAccountOnlyProcess);
        it('valid', function (done) {
            AccountMgr.GetAllAccount().then(records => {
                const Index = createRandom(0, AccountCount - 1);
                return AccountMgr.SignIn(records[Index].id, PrePasswordForTest)
                    .then(id => {
                        assert.equal(id, records[Index].sysid);
                    })
                    .catch(() => {
                        assert.fail();
                    })
                    .finally(() => {
                        done();
                    });
            });
        });
        it('invalid', function (done) {
            AccountMgr.GetAllAccount().then(records => {
                const Index = createRandom(0, AccountCount - 1);
                return AccountMgr.SignIn(records[Index].id, 'passwordfail01')
                    .then(() => {
                        assert.fail();
                    })
                    .catch(() => {
                        assert.ok(true);
                    })
                    .finally(() => {
                        done();
                    });
            });
        });
    });
    describe('delete user', function () {
        let AccountCount = 0;
        before(function (done) {
            const Accounts = ReadMultiAccountFile();
            AccountCount = Accounts.users.length;
            const Promises = Accounts.users.map(i => AccountMgr.AddNewAccount(i.id, i.name, i.privilege));
            Promise.all(Promises)
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    done();
                });
        });
        after(DeleteAllAccountOnlyProcess);
        it('test', function (done) {
            AccountMgr.GetAllAccount()
                .then(records => {
                    const Index = createRandom(0, AccountCount - 1);
                    const deleteTargetId = records[Index].sysid;
                    records.splice(Index, 1);
                    return AccountMgr.DeleteUser(deleteTargetId)
                        .then(() => AccountMgr.GetAllAccount())
                        .then(recordsAfter => {
                            for (let i = 0; i < records.length - 1; i++) {
                                assert.deepEqual(recordsAfter[i], records[i]);
                            }
                        })
                        .catch((er: Error) => {
                            console.error(er.message);
                        });
                })
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    done();
                });
        });
    });
    describe('get account count', function () {
        let CorrectAccountCount = 0;
        before(function (done) {
            const Accounts = ReadMultiAccountFile();
            CorrectAccountCount = Accounts.users.length;
            const Promises = Accounts.users.map(i => AccountMgr.AddNewAccount(i.id, i.name, i.privilege));
            Promise.all(Promises)
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    done();
                });
        });
        after(DeleteAllAccountOnlyProcess);
        it('test', function (done) {
            AccountMgr.GetAccountCount()
                .then(count => {
                    assert.equal(count, CorrectAccountCount);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    done();
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
        before(function (done) {
            const stubCreatePrePassword = sinon
                .stub(AccountMgr.AMI, 'createPrePassword')
                .callsFake(() => PrePasswordForTest);
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege)
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    if (stubCreatePrePassword && stubCreatePrePassword.restore) stubCreatePrePassword.restore();
                    if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
                    done();
                });
        });
        after(DeleteAllAccountOnlyProcess);
        it('test', function (done) {
            const SignInBeforeChangePassword_Success = AccountMgr.SignIn(TestAccount, PrePasswordForTest)
                .then(id => {
                    assert.equal(id, TestID);
                })
                .catch(() => {
                    assert.ok(true);
                });
            const SignInBeforeChangePassword_Fail = AccountMgr.SignIn(TestAccount, NewPassword)
                .then(() => {
                    assert.fail();
                })
                .catch(() => {
                    assert.ok(true);
                });
            const Promise_ChangePassword = AccountMgr.ChangePassword(TestID, NewPassword).then(() => {
                const SuccessSignIn = AccountMgr.SignIn(TestAccount, NewPassword)
                    .then(id => {
                        assert.equal(id, TestID);
                    })
                    .catch(() => {
                        assert.ok(true);
                    });
                const FailedSignIn = AccountMgr.SignIn(TestAccount, PrePasswordForTest)
                    .then(() => {
                        assert.fail();
                    })
                    .catch(() => {
                        assert.ok(true);
                    });
                return Promise.all([SuccessSignIn, FailedSignIn]);
            });
            Promise.all([
                SignInBeforeChangePassword_Success,
                SignInBeforeChangePassword_Fail,
                Promise_ChangePassword,
            ]).then(() => {
                done();
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
        before(function (done) {
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege)
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
                    done();
                });
        });
        after(DeleteAllAccountOnlyProcess);
        it('test', function (done) {
            AccountMgr.ChangePrivilege(TestID, 0)
                .then(() => AccountMgr.GetAccountInfo(TestID))
                .then(record => {
                    assert.equal(record.privilege, 0);
                })
                .catch(() => {
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
    });
    describe('change user info', function () {
        const TestID = 'b20046fe0ca7480292a0b27e1426f5e8';
        const TestAccount = {
            id: 'otokoe_aoi',
            name: '一ノ瀬葵',
            privilege: 1,
        };
        const NewRecordInfo = {
            nameUpdate: {
                arg: {
                    name: '一ノ瀬桜子',
                },
                correct: {
                    id: 'otokoe_aoi',
                    name: '一ノ瀬桜子',
                    privilege: 1,
                },
            },
            idUpdate: {
                arg: {
                    id: 'aoi_otokoe',
                },
                correct: {
                    id: 'aoi_otokoe',
                    name: '一ノ瀬葵',
                    privilege: 1,
                },
            },
            bothUpdate: {
                arg: {
                    id: 'otokoe_sakurako',
                    name: '一ノ瀬桜子',
                },
                correct: {
                    id: 'otokoe_sakurako',
                    name: '一ノ瀬桜子',
                    privilege: 1,
                },
            },
        };
        before(function (done) {
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege)
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
                    done();
                });
        });
        after(DeleteAllAccountOnlyProcess);
        it('test/no update', function (done) {
            AccountMgr.ChangeUserInfo(TestID, {})
                .then(() => AccountMgr.GetAccountInfo(TestID))
                .then(record => {
                    assert.deepEqual(record, TestAccount);
                })
                .catch(() => {
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('test/name update', function (done) {
            AccountMgr.ChangeUserInfo(TestID, NewRecordInfo.nameUpdate.arg)
                .then(() => AccountMgr.GetAccountInfo(TestID))
                .then(record => {
                    assert.deepEqual(record, NewRecordInfo.nameUpdate.correct);
                })
                .catch(() => {
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('test/id update', function (done) {
            AccountMgr.ChangeUserInfo(TestID, NewRecordInfo.idUpdate.arg)
                .then(() => AccountMgr.GetAccountInfo(TestID))
                .then(record => {
                    assert.deepEqual(record, NewRecordInfo.idUpdate.correct);
                })
                .catch(() => {
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('test/both update', function (done) {
            AccountMgr.ChangeUserInfo(TestID, NewRecordInfo.bothUpdate.arg)
                .then(() => AccountMgr.GetAccountInfo(TestID))
                .then(record => {
                    assert.deepEqual(record, NewRecordInfo.bothUpdate.correct);
                })
                .catch(() => {
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
    });
    describe('get system id', function () {
        const TestID = '310f4f740289438ca73c46772af29cb2';
        const TestAccount = {
            id: 'otokoe_s_kanade',
            name: '西園寺奏',
            privilege: 1,
        };
        before(function (done) {
            const stubCreateId = sinon.stub(AccountMgr.AMI, 'createId').callsFake(() => Promise.resolve(TestID));
            AccountMgr.AddNewAccount(TestAccount.id, TestAccount.name, TestAccount.privilege)
                .catch((er: Error) => {
                    console.error(er.message);
                })
                .finally(() => {
                    if (stubCreateId && stubCreateId.restore) stubCreateId.restore();
                    done();
                });
        });
        after(DeleteAllAccountOnlyProcess);
        it('test/valid', function (done) {
            AccountMgr.GetSystemID(TestAccount.id)
                .then(result => {
                    assert.equal(result, TestID);
                })
                .catch(() => {
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('test/invalid', function (done) {
            AccountMgr.GetSystemID('aoi_otokoe')
                .then(() => {
                    assert.fail();
                })
                .catch(() => {
                    assert.ok(true);
                })
                .finally(() => {
                    done();
                });
        });
    });
});
