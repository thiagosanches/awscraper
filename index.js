const process = require('process');
const sqlite = require('./ingestors/sqlite');

const cloudfront = require('./scrapers/cloudfront');
const cloudfrontMapper = require('./mappers/cloudfront');

const ec2 = require('./scrapers/ec2');
const ec2Mapper = require('./mappers/ec2');

const s3 = require('./scrapers/s3');
const s3Mapper = require('./mappers/s3');

const lambda = require('./scrapers/lambda');
const lambdaMapper = require('./mappers/lambda');

const iamUsers = require('./scrapers/iamUsers');
const iamUsersMapper = require('./mappers/iamUsers');

const awsOrganization = require('./utils/awsOrganization');
const awsCredentials = require('./utils/awsCredentials');

const awsRegions = require('./utils/awsRegions');

try {
    (async () => {
        const accounts = [];

        // Someone wants to scrape just one account instead of an entire organization.
        if (process.env.AWSCRAPER_ACCOUNT_ID) {
            accounts.push({
                Id: process.env.AWSCRAPER_ACCOUNT_ID,
                Name: process.env.AWSCRAPER_ACCOUNT_NAME,
            });
        } else {
            accounts.push(await awsOrganization.getChildrenAccounts());
        }

        for (let i = 0; i < accounts.length; i += 1) {
            const account = accounts[i];
            const credentialsParams = await awsCredentials.getTemporaryAWSCredentialsForAccount(account.Id);
            const regions = await awsRegions.getEnabledRegions(account, credentialsParams);

            for (let j = 0; j < regions.Regions.length; j += 1) {
                const region = regions.Regions[j];
                account.Region = region.RegionName;
                console.log(`🌎 Scrapping from '${account.Region}' region!`);
                sqlite.ingest(await ec2Mapper.map(await ec2.scrape(account, credentialsParams)));
                sqlite.ingest(await cloudfrontMapper.map(await cloudfront.scrape(account, credentialsParams)));
                sqlite.ingest(await s3Mapper.map(await s3.scrape(account, credentialsParams)));
                sqlite.ingest(await lambdaMapper.map(await lambda.scrape(account, credentialsParams)));
                sqlite.ingest(await iamUsersMapper.map(await iamUsers.scrape(account, credentialsParams)));
            }
            console.log('======================================');
        }
    })();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
