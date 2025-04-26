const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('s3 scraper', () => {
  let scrape;
  let listBucketsStub;
  let getEncryptionStub;
  let getTaggingStub;
  let listTieringStub;
  let mapStub;

  beforeEach(() => {
    listBucketsStub = sinon.stub();
    listBucketsStub.returns({ promise: () => Promise.resolve({ Buckets: [{ Name: 'b1' }], NextToken: null }) });
    getEncryptionStub = sinon.stub();
    getEncryptionStub.withArgs({ Bucket: 'b1' }).returns({ promise: () => Promise.resolve({ ServerSideEncryptionConfiguration: ['enc'] }) });
    getTaggingStub = sinon.stub();
    getTaggingStub.withArgs({ Bucket: 'b1' }).returns({ promise: () => Promise.resolve({ TagSet: [{ Key: 'k', Value: 'v' }] }) });
    listTieringStub = sinon.stub();
    listTieringStub.withArgs({ Bucket: 'b1' }).returns({ promise: () => Promise.resolve(['tiering']) });
    const s3Stub = {
      listBuckets: listBucketsStub,
      getBucketEncryption: getEncryptionStub,
      getBucketTagging: getTaggingStub,
      listBucketIntelligentTieringConfigurations: listTieringStub
    };
    const AWSStub = { S3: sinon.stub().returns(s3Stub) };
    mapStub = sinon.stub().resolves('mapped');
    const scraper = proxyquire('../../scrapers/s3', {
      'aws-sdk': AWSStub,
      '../mappers/s3': { map: mapStub }
    });
    scrape = scraper.scrape;
  });

  it('should fetch buckets, enrich data and map results', async () => {
    const account = { Id: 'acc', Name: 'Test' };
    const creds = {};
    const result = await scrape(account, creds);
    chai.expect(listBucketsStub.calledOnce).to.be.true;
    chai.expect(getEncryptionStub.calledOnce).to.be.true;
    chai.expect(getTaggingStub.calledOnce).to.be.true;
    chai.expect(listTieringStub.calledOnce).to.be.true;
    chai.expect(mapStub.calledOnce).to.be.true;
    const dataArg = mapStub.firstCall.args[0];
    chai.expect(dataArg).to.include({ type: 's3', accountId: 'acc', accountName: 'Test' });
    chai.expect(dataArg.items).to.be.an('array').with.lengthOf(1);
    const bucket = dataArg.items[0];
    chai.expect(bucket.Name).to.equal('b1');
    chai.expect(bucket.Encryption).to.deep.equal(['enc']);
    chai.expect(bucket.Tags).to.deep.equal([{ Key: 'k', Value: 'v' }]);
    chai.expect(bucket.IntelligentTieringConfigurations).to.deep.equal(['tiering']);
    chai.expect(result).to.equal('mapped');
  });
});