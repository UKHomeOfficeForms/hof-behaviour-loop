'use strict';

const LoopBehaviour = require('../../').Loop;
const Controller = require('hof-form-controller').Controller;
const Loop = LoopBehaviour(Controller);
const loopPageSummary = new Loop({loopData: {}}).loopPageSummary;

describe('Loop page summary', () => {

  it('should return the expected loop summary', () => {
    const options = {
      loopData: {
        sectionKey: 'some-section'
      }
    };
    const req = request({});
    req.form.options.loopData = options.loopData;

    loopPageSummary.helpers = {
      resolveTitle: sinon.stub(),
      toDisplayableSummary: sinon.stub(),
      conditionalTranslate: sinon.stub()
    };

    const items = [{}];

    const itemSummaries = [{
      field1: 'badger'
    }];
    loopPageSummary.helpers.toDisplayableSummary.returns(itemSummaries);
    loopPageSummary.helpers.resolveTitle.returns('some title');
    loopPageSummary.helpers.conditionalTranslate.returns('some intro');
    req.translate.withArgs('pages.some-section.header').returns('summary title');
    req.translate.withArgs('pages.some-section.delete-text').returns('delete text');

    const returned = loopPageSummary.summaryFor(req, 'root-something', items, options);

    loopPageSummary.helpers.toDisplayableSummary.should.have.been.calledOnce
      .and.calledWithExactly(req, items, options);
    loopPageSummary.helpers.resolveTitle.should.have.been.calledOnce
      .and.calledWithExactly(req, false, 'root-something');
    loopPageSummary.helpers.conditionalTranslate.should.have.been.calledOnce
      .and.calledWithExactly('pages.root-something.intro', req.translate);

    req.translate.should.have.been.calledWithExactly('pages.some-section.header');
    req.translate.should.have.been.calledWithExactly('pages.some-section.delete-text');

    expect(returned).to.deep.equal({
      title: 'some title',
      intro: 'some intro',
      items: itemSummaries,
      summaryTitle: 'summary title',
      hasItems: 1,
      deleteText: 'delete text'
    });
  });

});
