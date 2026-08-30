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
            configure() {},
        };
        const sqlite3Stub = {
            verbose() {
                return this;
            },
            // must be a regular function to support `new sqlite3.Database(...)`
            Database: function Database() {
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

        // Expect create resources table + index
        chai.expect(execCalls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS "resources"'))).to.be.true;
        chai.expect(execCalls.some((sql) => sql.includes('CREATE INDEX IF NOT EXISTS idx_resources_lookup'))).to.be.true;
        // Expect transaction wrapping
        chai.expect(runCalls.some((call) => call.sql === 'BEGIN')).to.be.true;
        chai.expect(runCalls.some((call) => call.sql === 'COMMIT')).to.be.true;
        // Expect upsert (ON CONFLICT) instead of plain INSERT
        chai.expect(runCalls.some((call) => call.sql.includes('INSERT INTO "resources"') && call.sql.includes('ON CONFLICT'))).to.be.true;
        // Expect create temp table scoped to type+account+region
        chai.expect(execCalls.some((sql) => sql.includes('CREATE TEMP TABLE IF NOT EXISTS "temp_testtype_acc123_us_west_2"'))).to.be.true;
        // Expect clear + populate temp table
        chai.expect(runCalls.some((call) => call.sql.includes('DELETE FROM "temp_testtype_acc123_us_west_2"'))).to.be.true;
        chai.expect(runCalls.some((call) => call.sql.includes('INSERT INTO "temp_testtype_acc123_us_west_2"'))).to.be.true;
        // Expect update deleted items
        chai.expect(runCalls.some((call) => call.sql.includes('UPDATE "resources"'))).to.be.true;
        // Expect drop temp table
        chai.expect(execCalls.some((sql) => sql.includes('DROP TABLE IF EXISTS "temp_testtype_acc123_us_west_2"'))).to.be.true;
    });
});
