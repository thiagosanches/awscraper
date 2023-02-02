const AWS = require('aws-sdk');

module.exports.getEnabledRegions = async function (account, credentialsParams) {
    console.log(`🌎 Getting all the enabled regions for Account Id: '${account.Id}'`);
    const ec2 = new AWS.EC2({ apiVersion: '2016-11-15', region: 'us-east-1', ...credentialsParams });
    const result = await ec2.describeRegions({}).promise();
    return result;
};
