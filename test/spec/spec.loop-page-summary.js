'use strict';

const LoopBehaviour = require('../../').Loop;
const Controller = require('hof-form-controller').Controller;
const Loop = LoopBehaviour(Controller);
const loopPageSummary = new Loop({loop: {}}).loopPageSummary;

describe('Loop page summary', () => {

  it('should return the expected loop summary', () => {
    const options = {
      loop: {
        sectionKey: 'some-section'
      }
    };
    const req = request({});
    req.form.options.loop = options.loop;

    loopPageSummary.helpers = {
      toDisplayableSummary: sinon.stub(),
      conditionalTranslate: sinon.stub()
    };

    const items = [{}];

    const itemSummaries = [{
      field1: 'badger'
    }];
    loopPageSummary.helpers.toDisplayableSummary.returns(itemSummaries);
    loopPageSummary.helpers.conditionalTranslate.withArgs(['pages.root-something.item-2-header',
      'pages.root-something.header']).returns('some title');
    loopPageSummary.helpers.conditionalTranslate.withArgs(['pages.root-something.item-2-intro',
      'pages.root-something.intro']).returns('some intro');
    req.translate.withArgs('pages.some-section.header').returns('summary title');
    req.translate.withArgs('pages.some-section.delete-text').returns('delete text');

    const returned = loopPageSummary.summaryFor(req, 'root-something', items, options);

    loopPageSummary.helpers.toDisplayableSummary.should.have.been.calledOnce
      .and.calledWithExactly(req, items, options);

    loopPageSummary.helpers.conditionalTranslate.should.have.been
            .calledWithExactly(['pages.root-something.item-2-header', 'pages.root-something.header'], req.translate);
    loopPageSummary.helpers.conditionalTranslate.should.have.been
      .calledWithExactly(['pages.root-something.item-2-intro', 'pages.root-something.intro'], req.translate);

    req.translate.should.have.been.calledWithExactly('pages.some-section.delete-text');

    expect(returned).to.deep.equal({
      title: 'some title',
      intro: 'some intro',
      items: itemSummaries,
      hasItems: 1,
      deleteText: 'delete text'
    });
  });

});
