# awscraper ⚙️
AWScraper is a backend tool to centralize all the cloud (AWS for now) data that we might need in order to make them part of an **inventory**. 

We can also add some custom data for any resource to make it easy to search them. In the future, there will be a front-end application that will read the database in order to display the information in an easy way for any non-technical user.

There will be a cron job that should run this periodically to continuing fetching the data.

We are also planning to add a logic that will create a relationship between the cloud resource and the source-code (nodejs, java, c#, no matter), when that exists.

Right now, we are saving the data into a SQLite database and managing it through [SQLiteStudio](https://www.sqlitestudio.pl/).

## Overview
There are 3 main components in the application:
- **Ingestors**: It's responsible to write the data into the database. At this moment, we are trying to define a model that fits for ALL.
- **Scrapers**: It's responsible to fetch all the data that you want (that you think it's important for you). It's important to remember to perform the operations in a paginated way if necessary.
- **Mappers**: It's responsible to transform the AWS object into a more customizable object that fits into the database.

![image](https://user-images.githubusercontent.com/5191469/215287058-017f344f-7dd1-45f3-b5b8-778b93769e04.png)



## Model (More info about ingestors)
To save the returned data from scrapers we defined a simple table:

```sql
CREATE TABLE IF NOT EXISTS "resources" (
"Id" TEXT NOT NULL,
"Type" TEXT,
"Status" TEXT NOT NULL,
"Team" TEXT,
"Comments" TEXT,
"LastModified" TEXT NOT NULL,
"RawObj" TEXT,
PRIMARY KEY("Id"));
```

No matter the resources, we are planning to store the **mandatory** fields:
- ID: the `ARN` of the resource (primary key).
- Type: a value defined programatically: `ec2`, `cloudfront` according to the original resource.
- Status: `LIVE` or `DELETED`.
- RawObject: a json object that could represent the whole AWS object or any object that you have built.

![image](https://user-images.githubusercontent.com/5191469/215285305-027433f3-7403-43d8-9104-e88669507dc0.png)

We can also rely on the built-in `json_extract()` function from SQLite, in order to extract the JSON data from the RawObj, if we want to return more details that are not part of the **mandatory** fields. For example, to return cloudfront distributions that doesn't have WebACLId:

```sql
SELECT Id from "resources" where json_extract(RawObj, '$.WebACLId') = ''
```

## How it works?
On **every** execution, **Scrapers** will always perform the operation that you developed them to do. **Mappers** will receive the data, perform some transformation and pass the objects to Ingestors.

**Ingestors** are the responsible to know how to write the data into the database. Right now, to handle items that were removed from the Cloud (AWS for now) we are saving everything into a temporary table to perform a `NOT IN` operation on SQLite against the existing data. If something that is not there on the AWS's list anymore, they are marked as `DELETED` on the database (resources table).

**We'll might have some performance issues in the future, so need to keep the eyes on this topic here.**

## How to contribute?
You can add more scrapers into this project to increase the capacity of this tool. Basically, you need to create two files and change the `index.js`, for example if you are going to add the `Route53` capability to the tool:

- `mappers/route53.js`
- `scrapers/route53.js`

Update the [index.js](./index.js) file, for example:

```javascript
const route53 = require('./scrapers/route53')
const route53Mapper = require('./mappers/route53');
...
sqlite.ingest(await route53Mapper.map(await route53.scrape()))
...
```

Please, consider the existing codes ([ec2.js](./scrapers/ec2.js) or [cloudfront.js](./scrapers/cloudfront.js)) when creating your new feature. They are not perfect, but it works (at least for now haha)!

