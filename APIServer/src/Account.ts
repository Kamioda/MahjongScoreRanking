import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { generate as createRandomString } from 'randomstring';
import * as crypto from 'crypto';

export interface UserInformation {
    id: string | null;
    name: string | null;
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
    constructor() {
        this.Client = new PrismaClient();
    }
    async AddNewAccount(PreID: string, Name: string, Level: number): Promise<NewAccountInformation> {
        const AccountInfo: NewAccountInformation = {
            id: PreID,
            password: createRandomString({ charset: 'alphanumeric' }),
        };
        await this.Client.accounts.create({
            data: {
                ID: uuidv4().replaceAll('-', ''),
                UserID: PreID,
                UserName: Name,
                Password: HashPassword(AccountInfo.password),
                AccountLevel: Level,
            },
        });
        return AccountInfo;
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
        this.Client.accounts.update({
            data: {
                AccountLevel: NewPriv,
            },
            where: {
                ID: ID,
            },
        });
    }
    async GetAccountInfo(ID: string): Promise<UserInformation> {
        return this.Client.accounts
            .findUnique({
                select: {
                    ID: true,
                    UserID: true,
                    UserName: true,
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
                };
            });
    }
    async SignIn(ID, Password): Promise<string> {
        return this.Client.accounts
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
        this.Client.accounts.delete({
            where: {
                ID: ID,
            },
        });
    }
    async GetAccountCount() {
        return this.Client.accounts.count();
    }
}
