const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

// Helper to promisify db.run
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
    });
});

module.exports.ingest = async function (data) {
    console.log(`💿 Ingesting '${data.type}' ${data.items.length} item(s)!`);

    // Create table using exec since it has no user input
    await new Promise((resolve, reject) => {
        db.exec(`CREATE TABLE IF NOT EXISTS "resources" (
            "Id"            TEXT NOT NULL,
            "AccountId"     TEXT NOT NULL,
            "AccountName"   TEXT NOT NULL,
            "Region"        TEXT NOT NULL,
            "Type"          TEXT NOT NULL,
            "Status"        TEXT NOT NULL,
            "Team"          TEXT,
            "Comments"      TEXT,
            "LastModified"  TEXT NOT NULL,
            "RawObj"        TEXT NOT NULL,
            PRIMARY KEY("Id"));`, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Insert or update resources using parameterized queries
    for (let i = 0; i < data.items.length; i += 1) {
        const obj = data.items[i];
        const insertSql = `
            INSERT INTO "resources" VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        `;

        try {
            await dbRun(insertSql, [
                obj.Id,
                obj.AccountId,
                obj.AccountName,
                obj.ResourceRegion,
                data.type,
                obj.Status,
                obj.Team || null,
                obj.Comments || null,
                obj.RawObj,
            ]);
        } catch (err) {
            // If it's SQLITE_CONSTRAINT error we already expect that!
            if (err.code === 'SQLITE_CONSTRAINT') {
                // Update the existing object
                const updateSql = 'UPDATE "resources" SET "LastModified" = CURRENT_TIMESTAMP, "RawObj" = ? WHERE "Id" = ?';
                await dbRun(updateSql, [obj.RawObj, obj.Id]);
            } else {
                console.error('Insert error:', err);
                throw err;
            }
        }
    }

    // checks for something that it was not returned by the scraper anymore,
    // so we need to remove it or mark it as 'DELETED' and not 'LIVE' anymore.

    // Per-call TEMP TABLE: session-scoped (no orphaning on crash), unique per type+account+region (concurrency-safe)
    const safeType = data.type.replace(/[^a-zA-Z0-9]/g, '_');
    const safeAccount = data.AccountId.replace(/[^a-zA-Z0-9]/g, '_');
    const safeRegion = data.ResourceRegion.replace(/[^a-zA-Z0-9]/g, '_');
    const tempTable = `temp_${safeType}_${safeAccount}_${safeRegion}`;

    await new Promise((resolve, reject) => {
        db.exec(`CREATE TEMP TABLE IF NOT EXISTS "${tempTable}" ("Id" TEXT NOT NULL, "AccountId" TEXT NOT NULL, "Region" TEXT NOT NULL)`, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    await dbRun(`DELETE FROM "${tempTable}"`, []);

    // Insert into temporary table using parameterized queries
    for (let i = 0; i < data.items.length; i += 1) {
        const obj = data.items[i];
        await dbRun(`INSERT INTO "${tempTable}" VALUES (?, ?, ?)`, [obj.Id, data.AccountId, data.ResourceRegion]);
    }

    // Update deleted items using parameterized queries
    const updateDeletedItemsSql = `
        UPDATE "resources" 
        SET "Status" = 'DELETED', 
        "LastModified" = CURRENT_TIMESTAMP 
        WHERE "Id" NOT IN (SELECT Id FROM "${tempTable}" WHERE "AccountId" = ? AND "Region" = ?) 
        AND "Type" = ? AND "AccountId" = ?
        AND "Region" = ?
        AND "Status" = 'LIVE'
    `;
    await dbRun(updateDeletedItemsSql, [data.AccountId, data.ResourceRegion, data.type, data.AccountId, data.ResourceRegion]);

    await new Promise((resolve, reject) => {
        db.exec(`DROP TABLE IF EXISTS "${tempTable}"`, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};
