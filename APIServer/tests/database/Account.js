import AccountManager from '../../features/Account.js';
import assert from 'assert';

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
    const AccountMgr = new AccountManagerForTest(new AccountManager());
    describe('add', function () {
        after(function() {
            AccountMgr.DeleteAllAccount();
        });
        it('test/admin', function () {
            AccountMgr.AddNewAccount('kamioda_ampsprg', '神御田', 0).then(data => {
                assert.equal(data.id, 'kamioda_ampsprg');
                assert.equal(data.password.length, 8);
            });
        });
        it('test/user', function() {
            AccountMgr.AddNewAccount('ayaka_meigetsu', '明月彩香', 1).then(data => {
                assert.equal(data.id, 'ayaka_meigetsu');
                assert.equal(data.password.length, 8);
            });
        });
    });
});
