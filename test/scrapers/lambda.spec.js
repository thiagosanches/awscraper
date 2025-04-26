const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('lambda scraper', () => {
  let scrape;
  let listStub;
  let mapStub;

  beforeEach(() => {
    listStub = sinon.stub();
    listStub.onCall(0).returns({ promise: () => Promise.resolve({ Functions: [{ name: 'f1' }], NextMarker: 'next' }) });
    listStub.onCall(1).returns({ promise: () => Promise.resolve({ Functions: [{ name: 'f2' }], NextMarker: null }) });
    const AWSStub = { Lambda: sinon.stub().returns({ listFunctions: listStub }) };
    mapStub = sinon.stub().resolves('mapped');
    const scraper = proxyquire('../../scrapers/lambda', {
      'aws-sdk': AWSStub,
      '../mappers/lambda': { map: mapStub }
    });
    scrape = scraper.scrape;
  });

  it('should fetch all functions and map results', async () => {
    const account = { Id: 'acc', Name: 'Test', Region: 'us-east-1' };
    const creds = {};
    const result = await scrape(account, creds);
    chai.expect(listStub.callCount).to.equal(2);
    chai.expect(mapStub.calledOnce).to.be.true;
    const dataArg = mapStub.firstCall.args[0];
    chai.expect(dataArg).to.include({ type: 'lambda', accountId: 'acc', accountName: 'Test', region: 'us-east-1' });
    chai.expect(dataArg.items).to.deep.equal([{ name: 'f1' }, { name: 'f2' }]);
    chai.expect(result).to.equal('mapped');
  });
});