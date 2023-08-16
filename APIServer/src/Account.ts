import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { generate as createRandomString } from 'randomstring';
import * as crypto from 'crypto';

export interface UserInformation {
    id: string | null;
    name: string | null;
    privilege: number | null;
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
    async ChangePassword(ID: string, NewPassword: string) {
        await this.Client.accounts.update({
            data: {
                Password: HashPassword(NewPassword),
            },
            where: {
                ID: ID,
            },
        });
    }
    async ChangeUserInfo(ID: string, NewRecord: UserInformation) {
        const UpdateInfo = {};
        if (NewRecord.id !== null) UpdateInfo['UserID'] = NewRecord.id;
        if (NewRecord.name !== null) UpdateInfo['UserName'] = NewRecord.name;
        if (Object.keys(UpdateInfo).length === 0) return;
        await this.Client.accounts.update({
            data: UpdateInfo,
            where: {
                ID: ID,
            },
        });
    }
    async ChangePrivilege(ID: string, NewPriv: number) {
        await this.Client.accounts.update({
            data: {
                AccountLevel: NewPriv,
            },
            where: {
                ID: ID,
            },
        });
    }
    async GetAccountInfo(ID: string): Promise<UserInformation> {
        return await this.Client.accounts
            .findUnique({
                select: {
                    ID: true,
                    UserID: true,
                    UserName: true,
                    AccountLevel: true,
                },
                where: {
                    ID: ID,
                },
            })
            .then(result => {
                if (result == null || result.ID !== ID) throw new Error('アカウントが見つかりません');
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
    async SignIn(ID, Password): Promise<string> {
        return await this.Client.accounts
            .findMany({
                select: {
                    ID: true,
                    Password: true,
                },
                where: {
                    OR: [
                        {
                            ID: ID,
                        },
                        {
                            UserID: ID,
                        },
                    ],
                },
            })
            .then(result => {
                if (result.length !== 1 || result[0].Password === HashPassword(Password))
                    throw new Error('IDまたはパスワードが違います');
                return result[0].ID;
            });
    }
    async DeleteUser(ID: string) {
        await this.Client.accounts.delete({
            where: {
                ID: ID,
            },
        });
    }
    async GetAccountCount() {
        return await this.Client.accounts.count();
    }
}

const PrePasswordLength =
    process.env.MAHJONG_PRE_PASSWORD_LEN == null ? 8 : parseInt(process.env.MAHJONG_PRE_PASSWORD_LEN);
export const Account = new AccountManager(PrePasswordLength);
