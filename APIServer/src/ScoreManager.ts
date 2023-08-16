import { readFileSync, writeFileSync, existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

interface RecordInformation {
    id: string;
    date: string;
    score: number;
}

export interface RecordInformations {
    [name: string]: RecordInformation[];
}

export interface AdditionalRecordInformations {
    [name: string]: number;
}

export default class ScoreManager {
    #FilePath: string;
    constructor(ScoreDataFilePath: string) {
        this.#FilePath = ScoreDataFilePath;
    }
    read(): RecordInformations {
        return (
            existsSync(this.#FilePath) ? JSON.parse(readFileSync(this.#FilePath, 'utf-8')) : {}
        ) as RecordInformations;
    }
    createId(CurrentRecord: RecordInformations): string {
        let ID = uuidv4().replaceAll('-', '');
        while (Object.keys(CurrentRecord).every(i => CurrentRecord[i].some(r => r.id === ID)))
            ID = uuidv4().replaceAll('-', '');
        return ID;
    }
    getDate(): string {
        return new Date().toISOString();
    }
    #write(NewData: RecordInformations) {
        writeFileSync(this.#FilePath, JSON.stringify(NewData), 'utf-8');
    }
    add(NewRecord: AdditionalRecordInformations) {
        const Record = this.read();
        const Now = this.getDate();
        const RecordID = this.createId(Record);
        Object.keys(NewRecord).forEach(i => {
            if (!Object.keys(Record).includes(i)) Record[i] = [];
            Record[i].push({
                id: RecordID,
                date: Now,
                score: NewRecord[i],
            });
        });
        this.#write(Record);
    }
    remove(RecordID: string) {
        const Record = this.read();
        Object.keys(Record).forEach(i => {
            const index = Record[i].findIndex(r => r.id === RecordID);
            if (index >= 0) Record[i].splice(index, 1);
        });
        this.#write(Record);
    }
}
