import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { generate as createRandomString } from 'randomstring';
import * as crypto from 'crypto';

export interface NewUserInformation {
    id: string | undefined | null;
    name: string | undefined | null;
}

export interface UserInformation {
    id: string;
    name: string;
    privilege: number;
}

export interface NewAccountInformation {
    id: string;
    password: string;
}

/**
 *
 * @param {string} RawPassword
 * @returns {string}
 */
export const HashPassword = RawPassword => {
    return crypto
        .createHash('sha512')
        .update('hiavnbla' + RawPassword + '9664641')
        .digest('hex');
};

const AllWhiteSpaceReg = /^[\s]{1,}$/;

export const IsNullOrWhiteSpace = (Val: string | null | undefined): boolean => {
    if (Val == null) return true;
    return Val.length === 0 || AllWhiteSpaceReg.test(Val);
};

export default class AccountManager {
    Client: PrismaClient;
    PrePasswordLength: number;
    constructor(PrePasswordLength: number = 8) {
        this.Client = new PrismaClient();
        this.PrePasswordLength = PrePasswordLength;
    }
    async createId(): Promise<string> {
        const generatedId = uuidv4().replaceAll('-', '');
        return await this.Client.accounts
            .count({
                where: {
                    ID: generatedId,
                },
            })
            .then(result => (result === 0 ? Promise.resolve(generatedId) : this.createId()));
    }
    createPrePassword(): string {
        return createRandomString({ charset: 'alphanumeric', length: this.PrePasswordLength });
    }
    async AddNewAccount(PreID: string, Name: string, Level: number): Promise<NewAccountInformation> {
        const AccountInfo: NewAccountInformation = {
            id: PreID,
            password: this.createPrePassword(),
        };
        return await this.createId()
            .then(accountId =>
                this.Client.accounts.create({
                    data: {
                        ID: accountId,
                        UserID: PreID,
                        UserName: Name,
                        Password: HashPassword(AccountInfo.password),
                        AccountLevel: Level,
                    },
                })
            )
            .then(() => AccountInfo);
    }
    async ChangePassword(SystemID: string, NewPassword: string) {
        const HashedPassword = HashPassword(NewPassword);
        return await this.Client.accounts
            .update({
                data: {
                    Password: HashedPassword,
                },
                where: {
                    ID: SystemID,
                },
            })
            .then(result => result.Password === HashedPassword);
    }
    async ChangeUserInfo(ID: string, NewRecord: NewUserInformation): Promise<UserInformation | void> {
        const UpdateInfo = {};
        if (!IsNullOrWhiteSpace(NewRecord.id)) UpdateInfo['UserID'] = NewRecord.id;
        if (!IsNullOrWhiteSpace(NewRecord.name)) UpdateInfo['UserName'] = NewRecord.name;
        if (Object.keys(UpdateInfo).length === 0) return;
        return await this.Client.accounts
            .update({
                data: UpdateInfo,
                where: {
                    ID: ID,
                },
            })
            .then(newRecord => {
                return {
                    id: newRecord.UserID,
                    name: newRecord.UserName,
                    privilege: newRecord.AccountLevel,
                };
            });
    }
    async ChangePrivilege(SystemID: string, NewPriv: number) {
        return await this.Client.accounts.update({
            data: {
                AccountLevel: NewPriv,
            },
            where: {
                ID: SystemID,
            },
        });
    }
    async GetAccountInfo(SystemID: string): Promise<UserInformation> {
        return await this.Client.accounts
            .findUnique({
                select: {
                    ID: true,
                    UserID: true,
                    UserName: true,
                    AccountLevel: true,
                },
                where: {
                    ID: SystemID,
                },
            })
            .then(result => {
                if (result == null || result.ID !== SystemID) throw new Error('アカウントが見つかりません');
                return {
                    id: result.UserID,
                    name: result.UserName,
                    privilege: result.AccountLevel,
                };
            });
    }
    async GetSystemID(UserID: string): Promise<string> {
        return await this.Client.accounts
            .findMany({
                select: {
                    ID: true,
                    UserID: true,
                },
                where: {
                    UserID: UserID,
                },
            })
            .then(results => {
                if (results == null || results.length !== 1 || results[0].UserID !== UserID)
                    throw new Error('Failed to get system id');
                return results[0].ID;
            });
    }
    async SignIn(UserID, Password): Promise<string> {
        return await this.Client.accounts
            .findMany({
                select: {
                    ID: true,
                    UserID: true,
                    Password: true,
                },
                where: {
                    UserID: UserID,
                },
            })
            .then(result => {
                if (result.length !== 1 || result[0].UserID !== UserID || result[0].Password !== HashPassword(Password))
                    throw new Error('IDまたはパスワードが違います');
                return result[0].ID;
            });
    }
    async DeleteUser(SystemID: string) {
        return await this.Client.accounts.delete({
            where: {
                ID: SystemID,
            },
        });
    }
    async GetAccountCount() {
        return await this.Client.accounts.count();
    }
}
