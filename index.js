const process = require('process');
const sqlite = require('./ingestors/sqlite');

/* scrapers */
const cloudfront = require('./scrapers/cloudfront');
const ec2 = require('./scrapers/ec2');
const s3 = require('./scrapers/s3');
const lambda = require('./scrapers/lambda');
const iamUsers = require('./scrapers/iamUsers');
const route53 = require('./scrapers/route53');

/* utils */
const awsOrganization = require('./utils/awsOrganization');
const awsCredentials = require('./utils/awsCredentials');
const awsRegions = require('./utils/awsRegions');

try {
    (async () => {
        const accounts = [];
        const promises = [];

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
            console.log(`👷 Working on account ${i + 1}/${accounts.length}!`);
            const account = accounts[i];

            const credentialsParams = await awsCredentials.getTemporaryAWSCredentialsForAccount(account.Id);
            const regions = await awsRegions.getEnabledRegions(account, credentialsParams);

            for (let j = 0; j < regions.Regions.length; j += 1) {
                const region = regions.Regions[j];
                account.Region = region.RegionName;
                console.log(`🌎 Scrapping from '${account.Region}' region!`);
                promises.push(ec2.scrape(account, credentialsParams));
                promises.push(lambda.scrape(account, credentialsParams));
            }

            // Scrapers that doesn't need regions.
            promises.push(iamUsers.scrape(account, credentialsParams));
            promises.push(cloudfront.scrape(account, credentialsParams));
            promises.push(s3.scrape(account, credentialsParams));
            promises.push(route53.scrape(account, credentialsParams));
        }
        const result = await Promise.all(promises);
        result.forEach((i) => {
            if (i.items && i.items.length > 0) sqlite.ingest(i);
        });
    })();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
