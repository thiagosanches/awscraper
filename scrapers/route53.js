const AWS = require('aws-sdk');
const mapper = require('../mappers/route53');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping Route53 data!');

    const route53 = new AWS.Route53({ apiVersion: '2013-04-01', ...credentialsParams });
    const data = {
        type: 'route53', items: [], accountId: account.Id, accountName: account.Name,
    };
    const params = { Marker: null };

    do {
        const result = await route53.listHostedZones(params).promise();
        params.Marker = result.Marker;

        for (let i = 0; i < result.HostedZones.length; i += 1) {
            const hostedZone = result.HostedZones[i];
            if (hostedZone.ResourceRecordSetCount > 0) {
                let IsTruncated = false;
                const paramsRecordSet = { StartRecordName: null, HostedZoneId: hostedZone.Id };
                do {
                    const resourceRecordSets = await route53.listResourceRecordSets(paramsRecordSet).promise();
                    IsTruncated = resourceRecordSets.IsTruncated;
                    paramsRecordSet.StartRecordName = resourceRecordSets.NextRecordName;

                    data.items.push(...resourceRecordSets.ResourceRecordSets);
                } while (IsTruncated);
            }
        }
    } while (params.Marker);

    const result = await mapper.map(data);
    return result;
};
