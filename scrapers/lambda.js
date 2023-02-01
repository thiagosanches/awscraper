const AWS = require('aws-sdk')

module.exports.scrape = async function () {
    console.log("⚙️ Scrapping Lambda data!")

    const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' })
    const data = { type: 'lambda', items: [] }
    const params = { Marker: null }

    do {
        const result = await lambda.listFunctions(params).promise()
        params.Marker = result.NextMarker
        result.Functions.forEach(i => data.items.push(i))
    } while (params.Marker)    
    return data
}
