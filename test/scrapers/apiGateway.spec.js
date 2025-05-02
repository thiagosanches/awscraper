const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('apiGateway scraper', () => {
  let scrape;
  let getStub;
  let mapStub;

  beforeEach(() => {
    getStub = sinon.stub();
    getStub.onCall(0).returns({ promise: () => Promise.resolve({ items: [{ id: '1' }], position: 'next' }) });
    getStub.onCall(1).returns({ promise: () => Promise.resolve({ items: [{ id: '2' }], position: null }) });
    const AWSStub = { APIGateway: sinon.stub().returns({ getRestApis: getStub }) };
    mapStub = sinon.stub().resolves('mapped');
    const scraper = proxyquire('../../scrapers/apiGateway', {
      'aws-sdk': AWSStub,
      '../mappers/apiGateway': { map: mapStub }
    });
    scrape = scraper.scrape;
  });

  it('should fetch all pages and map results', async () => {
    const account = { Id: 'acc', Name: 'Test', Region: 'us-east-1' };
    const creds = { ak: 'x', sk: 'y' };
    const result = await scrape(account, creds);
    chai.expect(getStub.callCount).to.equal(2);
    chai.expect(mapStub.calledOnce).to.be.true;
    const dataArg = mapStub.firstCall.args[0];
    chai.expect(dataArg).to.include({ type: 'api-gateway', accountId: 'acc', accountName: 'Test', region: 'us-east-1' });
    chai.expect(dataArg.items).to.deep.equal([{ id: '1' }, { id: '2' }]);
    chai.expect(result).to.equal('mapped');
  });
});