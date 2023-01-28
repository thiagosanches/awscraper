const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('database.db');

module.exports.ingest = async function (data) {
    console.log("💿 Ingesting received data!")
    await db.exec(`CREATE TABLE IF NOT EXISTS "resources" (
        "Id"        TEXT NOT NULL,
        "Type"      TEXT,
        "Status"	TEXT NOT NULL,
        "Team"      TEXT,
        "Comments"	TEXT,
        "LastModified" TEXT NOT NULL,
        "RawObj"	TEXT,
        PRIMARY KEY("Id"));`)

    for (let i = 0; i < data.items.length; i++) {
        const obj = data.items[i]
        db.exec(`INSERT INTO "resources" VALUES ('${obj.Id}', '${data.type}', '${obj.Status}', '${obj.Team}', '${obj.Comments}', CURRENT_TIMESTAMP, '${obj.RawObj}');`, err => {
            if (err && err.code !== 'SQLITE_CONSTRAINT') // If it's contraint error we already expect that!
                console.log(err)
        })
    }

    //checks for something that it was not returned by the scrapper anymore, 
    //so we need to remove it or mark it as 'DELETED' and not 'LIVE' anymore.
    const d = new Date()
    const formattedDate = ("0" + d.getDate()).slice(-2) + ("0" + (d.getMonth() + 1)).slice(-2) + d.getFullYear() + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2);
    const temporaryTable = `${data.type}_${formattedDate}`
    const createTemporaryTable = `CREATE TABLE "${temporaryTable}" ("Id" TEXT NOT NULL);`
    await db.exec(createTemporaryTable)

    for (let i = 0; i < data.items.length; i++) {
        const obj = data.items[i]
        db.exec(`INSERT INTO "${temporaryTable}" VALUES ('${obj.Id}');`)
    }

    const updateDeletedItemsSql = `UPDATE "resources" SET "Status" = 'DELETED', "LastModified" = CURRENT_TIMESTAMP where Id NOT IN (SELECT Id FROM "${temporaryTable}") and "Type" = '${data.type}';`
    await db.exec(updateDeletedItemsSql)

    //remove the temp table.
    await db.exec(`DROP TABLE ${temporaryTable};`)
}
