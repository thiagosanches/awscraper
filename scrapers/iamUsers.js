const AWS = require('aws-sdk');
const mapper = require('../mappers/iamUsers');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping IAM data!');

    const iam = new AWS.IAM({ apiVersion: '2010-05-08', ...credentialsParams });
    const data = {
        type: 'iam-users', items: [], accountId: account.Id, accountName: account.Name,
    };
    const params = { Marker: null };
    const promises = [];

    do {
        const result = await iam.listUsers(params).promise();
        params.Marker = result.Marker;
        for (let i = 0; i < result.Users.length; i += 1) {
            const obj = result.Users[i];
            obj.AccessKeys = iam.listAccessKeys({ UserName: obj.UserName }).promise();
            data.items.push(obj);
            promises.push(obj.AccessKeys);
        }
    } while (params.Marker);
    await Promise.allSettled(promises);
    data.items.forEach((b) => b.AccessKeys.then((r) => {
        b.AccessKeys = r.AccessKeyMetadata;
    }, (e) => {
        b.AccessKeys = e.code;
    }));

    const result = await mapper.map(data);
    return result;
};
