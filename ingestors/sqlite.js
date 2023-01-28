const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('database.db');

module.exports.ingest = async function (data) {
    console.log("       Ingesting received data!")
    await db.exec(`CREATE TABLE IF NOT EXISTS "resources" (
        "Id"        TEXT NOT NULL,
        "Type"      TEXT,
        "Status"	TEXT NOT NULL,
        "Team"      TEXT,
        "Comments"	TEXT,
        "RawObj"	TEXT,
        PRIMARY KEY("Id"));`)

    for (let i = 0; i < data.items.length; i++) {
        const obj = data.items[i]
        db.exec(`INSERT INTO "resources" VALUES (\"${obj.Id}\", \"${data.type}\", \"${obj.Status}\", \"${obj.Team}\", \"${obj.Comments}\", '${obj.RawObj}')`, err => {
            if (err) console.log(`${obj.Id} already ingested!`)
        })
    }
}
