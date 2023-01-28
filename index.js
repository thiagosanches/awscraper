const process = require('process');
const sqlite = require('./ingestors/sqlite');

const cloudfront = require('./scrapers/cloudfront');
const cloudfrontMapper = require('./mappers/cloudfront');

const ec2 = require('./scrapers/ec2')
const ec2Mapper = require('./mappers/ec2');

try {
    (async () => {
        sqlite.ingest(await ec2Mapper.map(await ec2.scrape()))
        sqlite.ingest(await cloudfrontMapper.map(await cloudfront.scrape()))
    })()
} catch (e) {
    console.error(e.message)
    process.exit(1)
}
