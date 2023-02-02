const process = require('process');
const sqlite = require('./ingestors/sqlite');

/* scrapers */
const cloudfront = require('./scrapers/cloudfront');
const ec2 = require('./scrapers/ec2');
const s3 = require('./scrapers/s3');
const lambda = require('./scrapers/lambda');
const iamUsers = require('./scrapers/iamUsers');

/* utils */
const awsOrganization = require('./utils/awsOrganization');
const awsCredentials = require('./utils/awsCredentials');
const awsRegions = require('./utils/awsRegions');

try {
    (async () => {
        const accounts = [];
        const promisses = [];

        // Someone wants to scrape just one account instead of an entire organization.
        if (process.env.AWSCRAPER_ACCOUNT_ID) {
            accounts.push({
                Id: process.env.AWSCRAPER_ACCOUNT_ID,
                Name: process.env.AWSCRAPER_ACCOUNT_NAME,
            });
        } else {
            accounts.push(...await awsOrganization.getChildrenAccounts());
        }

        for (let i = 0; i < accounts.length; i += 1) {
            const account = accounts[i];
            const credentialsParams = await awsCredentials.getTemporaryAWSCredentialsForAccount(account.Id);
            const regions = await awsRegions.getEnabledRegions(account, credentialsParams);

            for (let j = 0; j < regions.Regions.length; j += 1) {
                const region = regions.Regions[j];
                account.Region = region.RegionName;
                console.log(`🌎 Scrapping from '${account.Region}' region!`);
                promisses.push(ec2.scrape(account, credentialsParams));
                promisses.push(lambda.scrape(account, credentialsParams));
            }

            // Scrappers that doesn't need regions.
            promisses.push(iamUsers.scrape(account, credentialsParams));
            promisses.push(cloudfront.scrape(account, credentialsParams));
            promisses.push(s3.scrape(account, credentialsParams));
        }
        const result = await Promise.all(promisses);
        result.forEach((i) => { sqlite.ingest(i); });
    })();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
