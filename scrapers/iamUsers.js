const AWS = require('aws-sdk');
const mapper = require('../mappers/iamUsers');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping IAM data!');

    const iam = new AWS.IAM({ apiVersion: '2010-05-08', ...credentialsParams });
    const data = {
        type: 'iam-users', items: [], accountId: account.Id, accountName: account.Name,
    };
    const params = { Marker: null };

    do {
        const result = await iam.listUsers(params).promise();
        params.Marker = result.Marker;
        for (let i = 0; i < result.Users.length; i += 1) {
            const obj = result.Users[i];
            obj.AccessKeys = iam.listAccessKeys({ UserName: obj.UserName }).promise();
            data.items.push(obj);
        }
    } while (params.Marker);

    for (let i = 0; i < data.items.length; i += 1) {
        const obj = data.items[i];
        const accessKeys = await obj.AccessKeys;
        if (accessKeys.AccessKeyMetadata) {
            obj.AccessKeys = accessKeys.AccessKeyMetadata;
        } else {
            obj.AccessKeys = [];
        }
    }

    const result = await mapper.map(data);
    return result;
};
