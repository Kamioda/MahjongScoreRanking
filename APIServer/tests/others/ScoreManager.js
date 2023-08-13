import ScoreManager from "../../features/ScoreManager.js";
import assert from 'assert';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import * as sinon from 'sinon';
import { expect } from 'expect';
const RecordFile = './record.json';

const testDate = new Date().toISOString();

const TestUseRecordDataBase = {
    kamioda_ampsprg: [
        { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 25000 },
        { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: 17000 },
        { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 23000 },
        { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: 40000 },
    ],
    ayaka_meigetsu: [
        { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 40000 },
        { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: 90000 },
        { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 0 },
        { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: 120000 }
    ],
    mirai_amairo: [
        { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 40000 },
        { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: -2000 },
        { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 82000 },
        { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: -55000 } 
    ]
};

describe('ScoreManager Test', function() {
    describe('read', function() {
        before(function() {
            writeFileSync(RecordFile, JSON.stringify(TestUseRecordDataBase));
        });
        after(function() {
            unlinkSync(RecordFile);
        });
        it('test', function() {
            const ScoreMgr = new ScoreManager(RecordFile);
            const Result = ScoreMgr.read();
            assert.deepEqual(Result, TestUseRecordDataBase);
        });
    });
    describe('create ID', function() {
        it('test', function() {
            const ScoreMgr = new ScoreManager(RecordFile);
            const ID = ScoreMgr.createId(TestUseRecordDataBase);
            TestUseRecordDataBase.kamioda_ampsprg.forEach(i => {
                assert.notEqual(ID, i.id);
            });
            TestUseRecordDataBase.ayaka_meigetsu.forEach(i => {
                assert.notEqual(ID, i.id);
            });
            TestUseRecordDataBase.mirai_amairo.forEach(i => {
                assert.notEqual(ID, i.id);
            });
        })
    });
    describe('add', function() {
        let stubUUIDV4 = null;
        let stubDate = null;
        const TestAddRecordData = {
            kamioda_ampsprg: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 25000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: 17000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 23000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: 40000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 1000 },
            ],
            ayaka_meigetsu: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: 90000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 0 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: 120000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 104000 },
            ],
            mirai_amairo: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: -2000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 82000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: -55000 }, 
            ],
            amairo_miyuki: [
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 0 }
            ]
        };
        before(function() {
            if (existsSync(RecordFile)) unlinkSync(RecordFile);
            writeFileSync(RecordFile, JSON.stringify(TestUseRecordDataBase));
        });
        it('test', function() {
            const ScoreMgr = new ScoreManager(RecordFile);
            stubUUIDV4 = sinon.stub(ScoreMgr, 'createId').callsFake(val => {
                expect(typeof val).toBe('object');
                return 'b305e055212d45a08e0d4b0491543f5f';
            });
            stubDate = sinon.stub(ScoreMgr, 'getDate').callsFake(() => testDate);
            ScoreMgr.add({ kamioda_ampsprg: 1000, ayaka_meigetsu: 104000, amairo_miyuki: 0 });
            assert.deepEqual(ScoreMgr.read(), TestAddRecordData);
        });
        after(function() {
            if (stubUUIDV4 && stubUUIDV4.restore) stubUUIDV4.restore();
            if (stubDate && stubDate.restore) stubDate.restore();
            unlinkSync(RecordFile);
        });
    });
    describe('remove', function() {
        const TestBeforeRemoveRecordData = {
            kamioda_ampsprg: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 25000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: 17000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 23000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: 40000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 1000 },
            ],
            ayaka_meigetsu: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: 90000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 0 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: 120000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 104000 },
            ],
            mirai_amairo: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: -2000 },
                { id: '72c9f897ece34c46852ea1882cba8790', date: testDate, score: 82000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: -55000 }, 
            ],
            amairo_miyuki: [
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 0 }
            ]
        };
        const TestAfterRemoveRecordData = {
            kamioda_ampsprg: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 25000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: 17000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: 40000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 1000 },
            ],
            ayaka_meigetsu: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: 90000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: 120000 },
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 104000 },
            ],
            mirai_amairo: [
                { id: '0ec8171c88c94b4e9df484df302a90dd', date: testDate, score: 40000 },
                { id: 'e0c4e6db48884b338b5f069099958a74', date: testDate, score: -2000 },
                { id: 'f321a0644733488c9a307ff1d9950a1e', date: testDate, score: -55000 }, 
            ],
            amairo_miyuki: [
                { id: 'b305e055212d45a08e0d4b0491543f5f', date: testDate, score: 0 }
            ]
        };
        before(function() {
            if (existsSync(RecordFile)) unlinkSync(RecordFile);
            writeFileSync(RecordFile, JSON.stringify(TestBeforeRemoveRecordData));
        });
        after(function(){
            unlinkSync(RecordFile);
        });
        it('test', function() {
            const ScoreMgr = new ScoreManager(RecordFile);
            ScoreMgr.remove('72c9f897ece34c46852ea1882cba8790');
            assert.deepEqual(ScoreMgr.read(), TestAfterRemoveRecordData);
        });
    });
});
