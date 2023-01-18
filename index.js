const process = require('process');
const ec2 = require('./scrapers/ec2')
const sqlite = require('./ingestors/sqlite')

try {
    (async () => {
        console.log("Welcome!")
        sqlite.ingest(ec2.scrape())
    })()
} catch (e) {
    console.error(e.message)
    process.exit(1)
}
