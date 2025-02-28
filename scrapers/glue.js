const AWS = require('aws-sdk');
const mapper = require('../mappers/glue');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping Glue data!');

    const glue = new AWS.Glue({ apiVersion: '2017-03-31', region: account.Region, ...credentialsParams });
    const data = {
        type: 'glue', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };

    const params = { NextToken: null };

    do {
        const result = await glue.getJobs(params).promise();

        for (let i = 0; i < result.Jobs.length; i += 1) {
            const executions = await glue.getJobRuns({
                JobName: result.Jobs[i].Name,
                MaxResults: 2 // to retrieve the last and previous execution results only.
            }).promise()

            if (executions.JobRuns &&
                executions.JobRuns.length > 0) {
                executions.JobRuns[0].ExecutionTimeMinutes = executions.JobRuns[0].ExecutionTime / 60;
                executions.JobRuns[0].ExecutionTimeHours = executions.JobRuns[0].ExecutionTime / 3600;
                
                // PLEASE REFACTOR THIS IS UGLY
                if (executions.JobRuns[1]) {
                    executions.JobRuns[1].ExecutionTimeMinutes = executions.JobRuns[1].ExecutionTime / 60;
                    executions.JobRuns[1].ExecutionTimeHours = executions.JobRuns[1].ExecutionTime / 3600;
                }

                result.Jobs[i].Executions = executions.JobRuns;
            }
        }

        params.NextToken = result.NextToken;
        if (result.Jobs) {
            result.Jobs.forEach((i) => data.items.push(i));
        }
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
