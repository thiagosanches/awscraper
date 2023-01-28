const process = require('process');
const ec2 = require('./scrapers/ec2')
const sqlite = require('./ingestors/sqlite');
const cloudfront = require('./scrapers/cloudfront');
const cloudfrontMapper = require('./mappers/cloudfront');

try {
    (async () => {
        console.log("Welcome!")
        //sqlite.ingest(await ec2.scrape())
        sqlite.ingest(await cloudfrontMapper.map(await cloudfront.scrape()))
    })()
} catch (e) {
    console.error(e.message)
    process.exit(1)
}
