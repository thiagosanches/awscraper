const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

// Helper to promisify db.run
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

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
                obj.RawObj
            ]);
        } catch (err) {
            // If it's SQLITE_CONSTRAINT error we already expect that!
            if (err.code === 'SQLITE_CONSTRAINT') {
                // Update the existing object
                const updateSql = `UPDATE "resources" SET "LastModified" = CURRENT_TIMESTAMP, "RawObj" = ? WHERE "Id" = ?`;
                await dbRun(updateSql, [obj.RawObj, obj.Id]);
            } else {
                console.error('Insert error:', err);
                throw err;
            }
        }
    }

    // checks for something that it was not returned by the scraper anymore,
    // so we need to remove it or mark it as 'DELETED' and not 'LIVE' anymore.
    const d = new Date();
    const formattedDate = (`0${d.getDate()}`).slice(-2) + (`0${d.getMonth() + 1}`).slice(-2) + d.getFullYear() + (`0${d.getHours()}`).slice(-2) + (`0${d.getMinutes()}`).slice(-2);
    const temporaryTable = `temp_${data.type.replace(/-/g, '_')}_${formattedDate}`;
    
    // Create temporary table (table name cannot be parameterized, but we control the value)
    const createTemporaryTable = `CREATE TABLE "${temporaryTable}" ("Id" TEXT NOT NULL, "AccountId" TEXT NOT NULL, "Region" TEXT NOT NULL);`;
    await new Promise((resolve, reject) => {
        db.exec(createTemporaryTable, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Insert into temporary table using parameterized queries
    for (let i = 0; i < data.items.length; i += 1) {
        const obj = data.items[i];
        await dbRun(`INSERT INTO "${temporaryTable}" VALUES (?, ?, ?)`, [obj.Id, data.AccountId, data.ResourceRegion]);
    }

    // Update deleted items using parameterized queries
    const updateDeletedItemsSql = `
        UPDATE "resources" 
        SET "Status" = 'DELETED', 
        "LastModified" = CURRENT_TIMESTAMP 
        WHERE "Id" NOT IN (SELECT Id FROM "${temporaryTable}" WHERE "AccountId" = ? AND "Region" = ?) 
        AND "Type" = ? AND "AccountId" = ?
        AND "Region" = ?
        AND "Status" = 'LIVE'
    `;
    await dbRun(updateDeletedItemsSql, [data.AccountId, data.ResourceRegion, data.type, data.AccountId, data.ResourceRegion]);

    // Remove the temp table
    await new Promise((resolve, reject) => {
        db.exec(`DROP TABLE "${temporaryTable}"`, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};
