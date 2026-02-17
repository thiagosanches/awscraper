const chai = require('chai');
const proxyquire = require('proxyquire');

describe('SQLite Ingestor', () => {
    let ingest;
    let execCalls;
    let runCalls;
    let fakeDb;

    beforeEach(() => {
        execCalls = [];
        runCalls = [];
        fakeDb = {
            exec: (sql, cb) => {
                execCalls.push(sql.trim());
                if (cb) setImmediate(() => cb(null));
            },
            run(sql, params, cb) {
                runCalls.push({ sql: sql.trim(), params });
                if (cb) setImmediate(() => cb.call({ lastID: 1, changes: 1 }, null));
            },
        };
        const sqlite3Stub = {
            verbose() {
                return this;
            },
            Database() {
                return fakeDb;
            },
        };
        const ingestor = proxyquire('../../ingestors/sqlite', { sqlite3: sqlite3Stub });
        ingest = ingestor.ingest;
    });

    it('should execute all necessary SQL statements', async () => {
        const data = {
            type: 'testtype',
            AccountId: 'acc123',
            ResourceRegion: 'us-west-2',
            items: [
                {
                    Id: '1', AccountId: 'acc123', AccountName: 'Name', ResourceRegion: 'us-west-2', Status: 'LIVE', Team: 'Team', Comments: 'Comment', RawObj: 'raw',
                },
            ],
        };

        await ingest(data);

        // Expect create resources table
        chai.expect(execCalls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS "resources"'))).to.be.true;
        // Expect insert into resources (should use parameterized query)
        chai.expect(runCalls.some((call) => call.sql.includes('INSERT INTO "resources"'))).to.be.true;
        // Expect create temporary table
        chai.expect(execCalls.some((sql) => sql.includes('CREATE TABLE "temp_testtype_'))).to.be.true;
        // Expect update deleted items
        chai.expect(runCalls.some((call) => call.sql.includes('UPDATE "resources"'))).to.be.true;
        // Expect drop temporary table
        chai.expect(execCalls.some((sql) => sql.includes('DROP TABLE'))).to.be.true;
    });
});
