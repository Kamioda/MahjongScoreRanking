import { describe, it, before, after } from 'mocha';
import AccountManager, { HashPassword, UserInformation } from '../../src/Account';
import assert from 'assert';
import * as sinon from 'sinon';
import { readFileSync } from 'fs';

interface AccountInformation {
    sysid: string;
    id: string;
    name: string;
    password: string;
    privilege: number;
}

interface AccountInformationTable {
    users: AccountInformation[];
    invalid_user: AccountInformation;
}

const ACINFO_TO_USRINFO = (Data: AccountInformation): UserInformation => {
    return {
        id: Data.id,
        name: Data.name,
        privilege: Data.privilege,
    };
};

const ReadMultiAccountFile = (): AccountInformationTable => {
    return JSON.parse(readFileSync('./testaccounts.json', 'utf-8')) as AccountInformationTable;
};

const AllAccounts = ReadMultiAccountFile();

const createRandom = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

class AccountManagerForTest {
    AMI: AccountManager;
    constructor(AccountManagerInstance) {
        this.AMI = AccountManagerInstance;
    }
    async createId() {
        return await this.AMI.createId();
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
    async SetupAccounts() {
        return await this.DeleteAllAccount().then(() => {
            const AddProcess = AllAccounts.users.map(async u => {
                return this.AMI.Client.accounts.create({
                    data: {
                        ID: u.sysid,
                        UserID: u.id,
                        UserName: u.name,
                        Password: HashPassword(u.password),
                        AccountLevel: u.privilege,
                    },
                });
            });
            return Promise.all(AddProcess);
        });
    }
    async DeleteAllAccount() {
        return this.AMI.Client.accounts.deleteMany();
    }
}

const AccountMgr = new AccountManagerForTest(new AccountManager());

describe('Account Manager Test', function () {
    describe('On clean table container', function () {
        beforeEach(function (done) {
            AccountMgr.GetAccountCount()
                .then(cnt => {
                    return cnt > 0 ? AccountMgr.DeleteAllAccount() : Promise.resolve(null);
                })
                .finally(() => {
                    done();
                });
        });
        it('create pre password/default', function () {
            const AccountMgrForCreatePrePassword = new AccountManager();
            assert.match(AccountMgrForCreatePrePassword.createPrePassword(), /^[0-9a-zA-Z]{8}$/);
        });
        it('create pre password/custom', function () {
            const AccountMgrForCreatePrePassword = new AccountManager(15);
            assert.match(AccountMgrForCreatePrePassword.createPrePassword(), /^[0-9a-zA-Z]{15}$/);
        });
        describe('add', function () {
            const PrePasswordForTest = 'password01';
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
                        assert.deepStrictEqual(data, expected);
                    })
                    .catch((er: Error) => {
                        console.error(er.message);
                        assert.fail();
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
                        assert.deepStrictEqual(data, expected);
                    })
                    .catch((er: Error) => {
                        console.error(er.message);
                        assert.fail();
                    })
                    .finally(() => {
                        done();
                    });
            });
        });
    });
    describe('On data include container', function () {
        this.timeout('20s');
        beforeEach(function (done) {
            AccountMgr.SetupAccounts().finally(() => {
                done();
            });
        });
        it('create id', function (done) {
            const AllIDs = AllAccounts.users.map(i => i.sysid);
            AccountMgr.createId()
                .then(result => {
                    assert.ok(!AllIDs.includes(result));
                })
                .catch(() => {
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('get user', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            const expected = ACINFO_TO_USRINFO(TargetAccount);
            AccountMgr.GetAccountInfo(TargetAccount.sysid)
                .then(result => {
                    assert.deepStrictEqual(result, expected);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('sign in/valid', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            AccountMgr.SignIn(TargetAccount.id, TargetAccount.password)
                .then(result => {
                    assert.strictEqual(result, TargetAccount.sysid);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('sign in/id invalid', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            AccountMgr.SignIn(AllAccounts.invalid_user.id, TargetAccount.password)
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
        it('sign in/password invalid', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            AccountMgr.SignIn(TargetAccount.id, AllAccounts.invalid_user.password)
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
        it('sign in/both invalid', function (done) {
            AccountMgr.SignIn(AllAccounts.invalid_user.id, AllAccounts.invalid_user.password)
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
        it('delete user', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            AccountMgr.DeleteUser(TargetAccount.sysid)
                .then(() => {
                    return AccountMgr.GetAccountInfo(TargetAccount.sysid)
                        .then(() => {
                            assert.fail();
                        })
                        .catch(() => {
                            assert.ok(true);
                        });
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('get account count', function (done) {
            AccountMgr.GetAccountCount()
                .then(count => {
                    assert.strictEqual(count, AllAccounts.users.length);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('change password', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            const NewPassword = 'passwordnew001';
            const SignInBeforeChangePassword_Success = AccountMgr.SignIn(TargetAccount.id, TargetAccount.password)
                .then(id => {
                    assert.strictEqual(id, TargetAccount.sysid);
                })
                .catch(() => {
                    assert.ok(true);
                });
            const SignInBeforeChangePassword_Fail = AccountMgr.SignIn(TargetAccount.id, NewPassword)
                .then(() => {
                    assert.fail();
                })
                .catch(() => {
                    assert.ok(true);
                });
            const Promise_ChangePassword = AccountMgr.ChangePassword(TargetAccount.sysid, NewPassword).then(() => {
                const SuccessSignIn = AccountMgr.SignIn(TargetAccount.id, NewPassword)
                    .then(id => {
                        assert.strictEqual(id, TargetAccount.sysid);
                    })
                    .catch((er: Error) => {
                        console.error(er.message);
                        assert.fail();
                    });
                const FailedSignIn = AccountMgr.SignIn(TargetAccount.id, TargetAccount.password)
                    .then(() => {
                        assert.fail();
                    })
                    .catch(() => {
                        assert.ok(true);
                    });
                return Promise.all([SuccessSignIn, FailedSignIn]);
            });
            Promise.all([SignInBeforeChangePassword_Success, SignInBeforeChangePassword_Fail, Promise_ChangePassword])
                .catch((er: Error) => {
                    console.log(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('change privilege', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            AccountMgr.ChangePrivilege(TargetAccount.sysid, 0)
                .then(() => AccountMgr.GetAccountInfo(TargetAccount.sysid))
                .then(record => {
                    assert.strictEqual(record.privilege, 0);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('change user info/no update', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            const expected = ACINFO_TO_USRINFO(TargetAccount);
            AccountMgr.ChangeUserInfo(TargetAccount.sysid, {})
                .then(() => AccountMgr.GetAccountInfo(TargetAccount.sysid))
                .then(record => {
                    assert.deepStrictEqual(record, expected);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('change user info/name update', function (done) {
            const arg = {
                id: 'aoi_otokoe',
            };
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            const expected = ACINFO_TO_USRINFO(TargetAccount);
            expected.id = arg.id;
            AccountMgr.ChangeUserInfo(TargetAccount.sysid, arg)
                .then(() => AccountMgr.GetAccountInfo(TargetAccount.sysid))
                .then(record => {
                    assert.deepStrictEqual(record, expected);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('change user info/id update', function (done) {
            const arg = {
                name: '一ノ瀬桜子',
            };
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            const expected = ACINFO_TO_USRINFO(TargetAccount);
            expected.name = arg.name;
            AccountMgr.ChangeUserInfo(TargetAccount.sysid, arg)
                .then(() => AccountMgr.GetAccountInfo(TargetAccount.sysid))
                .then(record => {
                    assert.deepStrictEqual(record, expected);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('test/both update', function (done) {
            const arg = {
                id: 'otokoe_sakurako',
                name: '一ノ瀬桜子',
            };
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            const expected = ACINFO_TO_USRINFO(TargetAccount);
            expected.id = arg.id;
            expected.name = arg.name;
            AccountMgr.ChangeUserInfo(TargetAccount.sysid, arg)
                .then(() => AccountMgr.GetAccountInfo(TargetAccount.sysid))
                .then(record => {
                    assert.deepStrictEqual(record, expected);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('get system id/valid', function (done) {
            const TargetAccount = AllAccounts.users[createRandom(0, AllAccounts.users.length - 1)];
            AccountMgr.GetSystemID(TargetAccount.id)
                .then(result => {
                    assert.strictEqual(result, TargetAccount.sysid);
                })
                .catch((er: Error) => {
                    console.error(er.message);
                    assert.fail();
                })
                .finally(() => {
                    done();
                });
        });
        it('get system id/invalid', function (done) {
            AccountMgr.GetSystemID(AllAccounts.invalid_user.id)
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
