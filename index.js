const process = require('process');
const sqlite = require('./ingestors/sqlite');

/* scrapers */
const cloudfront = require('./scrapers/cloudfront');
const ec2 = require('./scrapers/ec2');
const s3 = require('./scrapers/s3');
const lambda = require('./scrapers/lambda');
const iamUsers = require('./scrapers/iamUsers');
const route53 = require('./scrapers/route53');
const ebs = require('./scrapers/ebs');
const dynamoDb = require('./scrapers/dynamoDb');
const rds = require('./scrapers/rds');
const elasticBeanstalk = require('./scrapers/elasticBeanstalk');
const sg = require('./scrapers/sg');
const sns = require('./scrapers/sns');
const sqs = require('./scrapers/sqs');
const apiGateway = require('./scrapers/apiGateway');
const nat = require('./scrapers/nat');
const ssm = require('./scrapers/ssm');
const autoscalinggroups = require('./scrapers/autoscalinggroups');
const dms = require('./scrapers/dms');
const glue = require('./scrapers/glue');
const kinesis = require('./scrapers/kinesis');

/* utils */
const awsOrganization = require('./utils/awsOrganization');
const awsCredentials = require('./utils/awsCredentials');
const awsRegions = require('./utils/awsRegions');

const ACCOUNT_IGNORE_LIST_PARAMETER_INDEX = 2;

try {
    (async () => {
        const accounts = [];
        const promises = [];

        // Use it to bypass the scraper on the ignored account.
        let accountIgnoreList = [];
        if (process.argv[ACCOUNT_IGNORE_LIST_PARAMETER_INDEX]) {
            accountIgnoreList = process.argv[ACCOUNT_IGNORE_LIST_PARAMETER_INDEX].split(',');
            console.log('Ignoring the following accounts:', accountIgnoreList);
        }

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

            if (accountIgnoreList.indexOf(account.Id) >= 0) continue;

            const credentialsParams = await awsCredentials.getTemporaryAWSCredentialsForAccount(account.Id);
            const regions = await awsRegions.getEnabledRegions(account, credentialsParams);

            for (let j = 0; j < regions.Regions.length; j += 1) {
                const region = regions.Regions[j];
                account.Region = region.RegionName;
                console.log(`🌎 Scrapping from '${account.Region}' region!`);
                promises.push(ec2.scrape(account, credentialsParams));
                promises.push(lambda.scrape(account, credentialsParams));
                promises.push(ebs.scrape(account, credentialsParams));
                promises.push(dynamoDb.scrape(account, credentialsParams));
                promises.push(rds.scrape(account, credentialsParams));
                promises.push(elasticBeanstalk.scrape(account, credentialsParams));
                promises.push(sg.scrape(account, credentialsParams));
                promises.push(sns.scrape(account, credentialsParams));
                promises.push(sqs.scrape(account, credentialsParams));
                promises.push(apiGateway.scrape(account, credentialsParams));
                promises.push(nat.scrape(account, credentialsParams));
                promises.push(ssm.scrape(account, credentialsParams));
                promises.push(autoscalinggroups.scrape(account, credentialsParams));
                promises.push(dms.scrape(account, credentialsParams));
                promises.push(glue.scrape(account, credentialsParams));
                promises.push(kinesis.scrape(account, credentialsParams));
            }

            // Scrapers that doesn't need regions.
            promises.push(iamUsers.scrape(account, credentialsParams));
            promises.push(cloudfront.scrape(account, credentialsParams));
            promises.push(s3.scrape(account, credentialsParams));
            promises.push(route53.scrape(account, credentialsParams));
        }
        const result = await Promise.all(promises);
        result.forEach((i) => {
            if (i.items) sqlite.ingest(i);
        });
    })();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
