import { Account } from '../Account';
import { RecordInformations } from '../ScoreManager';

export async function convert(Records: RecordInformations): Promise<RecordInformations> {
    const UserIDs = {};
    const Keys = Object.keys(Records);
    const Promises: Promise<void>[] = Keys.map(
        async i =>
            await Account.GetSystemID(i).then(result => {
                UserIDs[i] = result;
            })
    );
    return await Promise.all(Promises).then((): RecordInformations => {
        const Ret: RecordInformations = {};
        Keys.forEach(i => {
            Ret[UserIDs[i]] = Records[i];
        });
        return Ret;
    });
}
