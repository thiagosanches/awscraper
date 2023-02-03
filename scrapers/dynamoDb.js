const AWS = require('aws-sdk');
const mapper = require('../mappers/dynamoDb');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping DynamoDB data!');

    const dynamoDb = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: account.Region, ...credentialsParams });
    const data = {
        type: 'dynamo-db', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { ExclusiveStartTableName: null };

    do {
        const result = await dynamoDb.listTables(params).promise();
        params.ExclusiveStartTableName = result.LastEvaluatedTableName;
        params.NextToken = result.NextToken;

        for (let i = 0; i < result.TableNames.length; i += 1) {
            const table = result.TableNames[i];
            const describedTable = await dynamoDb.describeTable({ TableName: table }).promise();

            if (describedTable.Table) {
                data.items.push({
                    Table: table,
                    ...describedTable.Table,
                });
            }
        }
    } while (params.ExclusiveStartTableName);

    const result = await mapper.map(data);
    return result;
};
