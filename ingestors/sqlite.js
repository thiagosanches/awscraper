const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('database.db');

async function nullable(column) {
    let value = "NULL"
    if (column)
        value = `'${column}'`
    return value
}

module.exports.ingest = async function (data) {
    console.log("💿 Ingesting received data!")
    db.exec(`CREATE TABLE IF NOT EXISTS "resources" (
        "Id"            TEXT NOT NULL,
        "Type"          TEXT NOT NULL,
        "Status"	    TEXT NOT NULL,
        "Team"          TEXT,
        "Comments"	    TEXT,
        "LastModified"  TEXT NOT NULL,
        "RawObj"	    TEXT NOT NULL,
        PRIMARY KEY("Id"));`)

    for (let i = 0; i < data.items.length; i++) {
        const obj = data.items[i]
        db.exec(`INSERT INTO "resources" VALUES ('${obj.Id}', '${data.type}', '${obj.Status}', ${await nullable(obj.Team)}, ${await nullable(obj.Comments)}, CURRENT_TIMESTAMP, '${obj.RawObj}');`, err => {
            if (err && err.code !== 'SQLITE_CONSTRAINT') // If it's SQLITE_CONSTRAINT error we already expect that!
                console.log(err)
        })
    }

    //checks for something that it was not returned by the scraper anymore, 
    //so we need to remove it or mark it as 'DELETED' and not 'LIVE' anymore.
    const d = new Date()
    const formattedDate = ("0" + d.getDate()).slice(-2) + ("0" + (d.getMonth() + 1)).slice(-2) + d.getFullYear() + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2);
    const temporaryTable = `${data.type}_${formattedDate}`
    const createTemporaryTable = `CREATE TABLE "${temporaryTable}" ("Id" TEXT NOT NULL);`
    db.exec(createTemporaryTable)

    for (let i = 0; i < data.items.length; i++) {
        const obj = data.items[i]
        db.exec(`INSERT INTO "${temporaryTable}" VALUES ('${obj.Id}');`)
    }

    const updateDeletedItemsSql = `UPDATE "resources" SET "Status" = 'DELETED', "LastModified" = CURRENT_TIMESTAMP where Id NOT IN (SELECT Id FROM "${temporaryTable}") and "Type" = '${data.type}';`
    db.exec(updateDeletedItemsSql)

    //remove the temp table.
    db.exec(`DROP TABLE ${temporaryTable};`)
}
