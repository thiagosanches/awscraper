const AWS = require('aws-sdk');

module.exports.getTemporaryAWSCredentialsForAccount = async function (accountId) {
    console.log(`🔑 Assuming Role on '${accountId}' account!`);

    if (process.env.AWSCRAPER_ACCOUNT_ID) {
        return {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
        };
    }

    const sts = new AWS.STS({ apiVersion: '2011-06-15' });
    const params = {
        RoleArn: `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
        RoleSessionName: 'AWSOrgSession',
    };
    const result = await sts.assumeRole(params).promise();
    return {
        accessKeyId: result.Credentials.AccessKeyId,
        secretAccessKey: result.Credentials.SecretAccessKey,
        sessionToken: result.Credentials.SessionToken,
    };
};
