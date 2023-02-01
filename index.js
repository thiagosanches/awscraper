const process = require('process');
const sqlite = require('./ingestors/sqlite');

const cloudfront = require('./scrapers/cloudfront');
const cloudfrontMapper = require('./mappers/cloudfront');

const ec2 = require('./scrapers/ec2')
const ec2Mapper = require('./mappers/ec2');

const s3 = require('./scrapers/s3')
const s3Mapper = require('./mappers/s3')

const lambda = require('./scrapers/lambda')
const lambdaMapper = require('./mappers/lambda');

try {
    (async () => {
        sqlite.ingest(await ec2Mapper.map(await ec2.scrape()))
        sqlite.ingest(await cloudfrontMapper.map(await cloudfront.scrape()))
        sqlite.ingest(await s3Mapper.map(await s3.scrape()))
        sqlite.ingest(await lambdaMapper.map(await lambda.scrape()))
    })()
} catch (e) {
    console.error(e.message)
    process.exit(1)
}
