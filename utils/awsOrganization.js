const AWS = require('aws-sdk');

module.exports.getChildrenAccounts = async function () {
    console.log('🧒 Getting \'ACTIVE\' children accounts!');

    const accounts = [];
    const params = { NextToken: null };
    const organization = new AWS.Organizations({ apiVersion: '2016-11-28' });
    do {
        const result = await organization.listAccounts(params).promise();
        accounts.push(...result.Accounts);
        params.NextToken = result.NextToken;
    } while (params.NextToken);
    return accounts.filter((a) => a.Status === 'ACTIVE');
};
