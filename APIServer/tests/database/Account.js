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
    async DeleteAllAccount() {
        this.AMI.Client.accounts.deleteMany();
    }
}

describe('Account Manager Test', function () {
    const PrePasswordForTest = 'password01';
    describe('add', function () {
        const AccountMgr = new AccountManagerForTest(new AccountManager());
        let stubCreatePrePassword = null;
        before(function() {
            stubCreatePrePassword = sinon.stub(AccountMgr.AMI, 'createPrePassword').callsFake(len => {
                expect(len).toBeGreaterThan(1);
                return PrePasswordForTest;
            });
        });
        after(function() {
            AccountMgr.DeleteAllAccount();
            if (stubCreatePrePassword && stubCreatePrePassword.restore) stubCreatePrePassword.restore();
        });
        it('test/admin', function () {
            const expected = {
                id: 'kamioda_ampsprg',
                password: PrePasswordForTest
            };
            AccountMgr.AddNewAccount('kamioda_ampsprg', '神御田', 0).then(data => {
                assert.deepEqual(data, expected);
            });
        });
        it('test/user', function() {
            const expected = {
                id: 'ayaka_meigetsu',
                password: PrePasswordForTest
            };
            AccountMgr.AddNewAccount('ayaka_meigetsu', '明月彩香', 1).then(data => {
                assert.deepEqual(data, expected);
            });
        });
    });
});
