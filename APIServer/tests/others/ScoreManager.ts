import { describe, it, before, after } from 'mocha';
import ScoreManager, { RecordInformations } from '../../src/ScoreManager';
import assert from 'assert';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import * as sinon from 'sinon';
const RecordFile = './record.json';

const testDate = new Date();
const testDateStr = testDate.toISOString();

const TestUseRecordDataBase = {
    kamioda_ampsprg: [
        { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 25000 },
        { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: 17000 },
        { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 23000 },
        { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: 40000 },
    ],
    ayaka_meigetsu: [
        { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 40000 },
        { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: 90000 },
        { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 0 },
        { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: 120000 },
    ],
    mirai_amairo: [
        { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 40000 },
        { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: -2000 },
        { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 82000 },
        { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: -55000 },
    ],
};

describe('ScoreManager Test', function () {
    describe('get date', function () {
        it('test', function () {
            const clock = sinon.useFakeTimers(testDate);
            const ScoreMgr = new ScoreManager(RecordFile);
            assert.strictEqual(ScoreMgr.getDate(), testDateStr);
            clock.restore();
        });
    });
    describe('read/file exist', function () {
        before(function () {
            writeFileSync(RecordFile, JSON.stringify(TestUseRecordDataBase));
        });
        after(function () {
            unlinkSync(RecordFile);
        });
        it('test', function () {
            const ScoreMgr = new ScoreManager(RecordFile);
            const Result = ScoreMgr.read();
            assert.deepStrictEqual(Result, TestUseRecordDataBase);
        });
    });
    describe('read/file not exist', function () {
        it('test', function () {
            const ScoreMgr = new ScoreManager(RecordFile);
            const Result = ScoreMgr.read();
            assert.deepStrictEqual(Result, {});
        });
    });
    describe('create ID', function () {
        it('test', function () {
            const ScoreMgr = new ScoreManager(RecordFile);
            const ID = ScoreMgr.createId(TestUseRecordDataBase);
            TestUseRecordDataBase.kamioda_ampsprg.forEach(i => {
                assert.notStrictEqual(ID, i.id);
            });
            TestUseRecordDataBase.ayaka_meigetsu.forEach(i => {
                assert.notStrictEqual(ID, i.id);
            });
            TestUseRecordDataBase.mirai_amairo.forEach(i => {
                assert.notStrictEqual(ID, i.id);
            });
        });
    });
    describe('add', function () {
        let stubUUIDV4: sinon.SinonStub<[CurrentRecord: RecordInformations], string> | null = null;
        const TestAddRecordData = {
            kamioda_ampsprg: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 25000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: 17000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 23000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: 40000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 1000 },
            ],
            ayaka_meigetsu: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: 90000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 0 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: 120000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 104000 },
            ],
            mirai_amairo: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: -2000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 82000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: -55000 },
            ],
            amairo_miyuki: [{ id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 0 }],
        };
        before(function () {
            if (existsSync(RecordFile)) unlinkSync(RecordFile);
            writeFileSync(RecordFile, JSON.stringify(TestUseRecordDataBase));
        });
        it('test', function () {
            const clock = sinon.useFakeTimers(testDate);
            const ScoreMgr = new ScoreManager(RecordFile);
            stubUUIDV4 = sinon.stub(ScoreMgr, 'createId').callsFake(() => {
                return 'b305e055212d45a08e0d4b0491543f5f';
            });
            ScoreMgr.add({ kamioda_ampsprg: 1000, ayaka_meigetsu: 104000, amairo_miyuki: 0 });
            assert.deepStrictEqual(ScoreMgr.read(), TestAddRecordData);
            clock.restore();
        });
        after(function () {
            if (stubUUIDV4 && stubUUIDV4.restore) stubUUIDV4.restore();
            unlinkSync(RecordFile);
        });
    });
    describe('remove', function () {
        const TestBeforeRemoveRecordData = {
            kamioda_ampsprg: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 25000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: 17000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 23000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: 40000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 1000 },
            ],
            ayaka_meigetsu: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: 90000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 0 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: 120000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 104000 },
            ],
            mirai_amairo: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: -2000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDateStr, score: 82000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: -55000 },
            ],
            amairo_miyuki: [{ id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 0 }],
        };
        const TestAfterRemoveRecordData = {
            kamioda_ampsprg: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 25000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: 17000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: 40000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 1000 },
            ],
            ayaka_meigetsu: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: 90000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: 120000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 104000 },
            ],
            mirai_amairo: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDateStr, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDateStr, score: -2000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDateStr, score: -55000 },
            ],
            amairo_miyuki: [{ id: 'b305e055212d45a08e0d4b0491543f5f', date: testDateStr, score: 0 }],
        };
        before(function () {
            if (existsSync(RecordFile)) unlinkSync(RecordFile);
            writeFileSync(RecordFile, JSON.stringify(TestBeforeRemoveRecordData));
        });
        after(function () {
            unlinkSync(RecordFile);
        });
        it('test', function () {
            const ScoreMgr = new ScoreManager(RecordFile);
            ScoreMgr.remove('72c9f897ece34c46852ea1882cba8790');
            assert.deepStrictEqual(ScoreMgr.read(), TestAfterRemoveRecordData);
        });
    });
});
