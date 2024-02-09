const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('blah.db');
var fs = require('fs/promises');

const sql = `
WITH RECURSIVE ArtifactHierarchy AS (
    SELECT *
      FROM artifact
     /*WHERE ParentId IN (
               SELECT ParentId
                 FROM artifact
                WHERE Identifier LIKE '%lambda%'
           )*/
    UNION ALL
    SELECT DISTINCT a.*
      FROM artifact a
           JOIN
           ArtifactHierarchy ah ON a.Id = ah.ParentId
)
SELECT DISTINCT *
  FROM ArtifactHierarchy
 ORDER BY ParentId;
`;

const runQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

const convertRawDataToHierarchicalJSON = (rawData, parentId = null) => {
    const data = [];
    for (const obj of rawData) {
        if (obj.ParentId === parentId) {
            const children = convertRawDataToHierarchicalJSON(rawData, obj.Id);
            if (children.length) {
                obj.children = children;
            }
            data.push(obj)
        }
    }
    return data;
}

try {
    (async () => {
        const rawData = await runQuery(sql);
        const hierarchicalData = convertRawDataToHierarchicalJSON(rawData, null);
        const root = {};
        root.Id = 0;
        root.Identifier = "ROOT";
        root.children = hierarchicalData;
        await fs.writeFile("bla.json", JSON.stringify(root));
    })()
} catch (e) {
    console.error(e.message);
    process.exit(1);
}



