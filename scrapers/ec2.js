const AWS = require('aws-sdk')

module.exports.scrape = async function () {
    console.log("⚙️ Scrapping EC2 data!")

    const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' })
    const data = { type: 'ec2', items: [] }
    const params = { NextToken: null }

    do {
        const result = await ec2.describeInstances(params).promise()
        params.NextToken = result.NextToken
        result.Reservations.forEach(i => data.items.push(...i.Instances))
    } while (params.NextToken)
    
    return data
}
