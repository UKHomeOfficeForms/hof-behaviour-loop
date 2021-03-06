'use strict';

const LoopBehaviour = require('../../').Loop;
const Controller = require('hof-form-controller').Controller;
const Loop = LoopBehaviour(Controller);
const helpers = new Loop({loop: {}}).loopPageSummary.helpers;

describe('Loop page summary helpers', () => {
  let req;

  beforeEach(() => {
    req = request({});
    req.translate.reset();
  });

  describe('conditionalTranslate', () => {

    describe('with an array of keys', () => {

      it('should return the first matching translation', () => {
        req.translate.withArgs('first.key').returns('badger');
        req.translate.withArgs('second.key').returns('monkeys');

        const returned = helpers.conditionalTranslate(['first.key', 'second.key'], req.translate);

        expect(returned).to.equal('badger');
      });

      it('should iterate keys until finding a translation', () => {
        req.translate.withArgs('first.key').returns('first.key');
        req.translate.withArgs('second.key').returns('monkeys');

        const returned = helpers.conditionalTranslate(['first.key', 'second.key'], req.translate);

        expect(returned).to.equal('monkeys');
      });

      it('should return undefined if no key has a translation', () => {
        req.translate.withArgs('first.key').returns('first.key');
        req.translate.withArgs('second.key').returns('second.key');

        const returned = helpers.conditionalTranslate(['first.key', 'second.key'], req.translate);

        expect(returned).to.be.an('undefined');
      });

    });

    describe('with a single key', () => {

      it('should return translation if it exists', () => {
        req.translate.withArgs('first.key').returns('badger');

        const returned = helpers.conditionalTranslate('first.key', req.translate);

        expect(returned).to.equal('badger');
      });

      it('should return undefined otherwise', () => {
        req.translate.withArgs('first.key').returns('first.key');

        const returned = helpers.conditionalTranslate('first.key', req.translate);

        expect(returned).to.be.an('undefined');
      });

    });

  });

  describe('toDisplayableSummary', () => {
    const loop = {
      sectionKey: 'some-section',
      subSteps: {
        'step-1': {
          fields: ['field1', 'field2']
        },
        'step-2': {
          fields: ['field3']
        }
      }
    };

    let options;

    beforeEach(() => {
       options = {
         fields: {
           field1: {},
           field2: {},
           field3: {}
         },
         fieldsConfig: {
           field1: {},
           field2: {},
           field3: {}
         },
         loop: loop
       };

      req.form.options.steps = options.steps;
    });

    describe('with no configuration overrides set', () => {
      it('should create appropriate summaries for a single item', () => {
        const items = [
          {
            field1: 'badger',
            field2: 'monkeys',
            field3: 'meerkat'
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly('pages.some-section.summary-item');
        req.translate.should.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'item title',
          editFieldsIndividually: true,
          editHeader: false,
          changeRoute: 'step-1',
          fields: [
            {
              field: 'field1',
              header: 'field 1 display',
              subroute: 'step-1',
              value: 'badger'
            },
            {
              field: 'field2',
              header: 'field 2 display',
              subroute: 'step-1',
              value: 'monkeys'
            },
            {
              field: 'field3',
              header: 'field 3 display',
              subroute: 'step-2',
              value: 'meerkat'
            }
          ]
        }]);
      });

      it('should format blank fields as they are presented', () => {
        const items = [
          {
            field1: '',
            field2: null,
            field3: undefined
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly('pages.some-section.summary-item');
        req.translate.should.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'item title',
          editFieldsIndividually: true,
          editHeader: false,
          changeRoute: 'step-1',
          fields: [
            {
              field: 'field1',
              header: 'field 1 display',
              subroute: 'step-1',
              value: ''
            },
            {
              field: 'field2',
              header: 'field 2 display',
              subroute: 'step-1',
              value: null
            },
            {
              field: 'field3',
              header: 'field 3 display',
              subroute: 'step-2',
              value: undefined
            }
          ]
        }]);
      });

      it('should create appropriate summaries for multiple items', () => {
        const items = [
          {
            field1: 'badger',
            field2: 'monkeys',
            field3: 'meerkat'
          },
          {
            field1: 'donkey',
            field2: 'rabbit',
            field3: 'giraffe'
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly('pages.some-section.summary-item');
        req.translate.should.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([
          {
            id: 0,
            deleteRoute: 'step-1',
            itemTitle: 'item title 1',
            editFieldsIndividually: true,
            editHeader: false,
            changeRoute: 'step-1',
            fields: [
              {
                field: 'field1',
                header: 'field 1 display',
                subroute: 'step-1',
                value: 'badger'
              },
              {
                field: 'field2',
                header: 'field 2 display',
                subroute: 'step-1',
                value: 'monkeys'
              },
              {
                field: 'field3',
                header: 'field 3 display',
                subroute: 'step-2',
                value: 'meerkat'
              }
            ]
          },
          {
            id: 1,
            deleteRoute: 'step-1',
            itemTitle: 'item title 2',
            editFieldsIndividually: true,
            editHeader: false,
            changeRoute: 'step-1',
            fields: [
              {
                field: 'field1',
                header: 'field 1 display',
                subroute: 'step-1',
                value: 'donkey'
              },
              {
                field: 'field2',
                header: 'field 2 display',
                subroute: 'step-1',
                value: 'rabbit'
              },
              {
                field: 'field3',
                header: 'field 3 display',
                subroute: 'step-2',
                value: 'giraffe'
              }
            ]
          }
        ]);
      });
    });

    describe('with field formatting overridden', () => {
      it('should use the configured `parse` function', () => {
        const items = [
          {
            field1: 'badger',
            field2: 'monkeys',
            field3: 'meerkat'
          }
        ];
        options.fieldsConfig = {
          field1: {
              parse: d => d + ' a'
          },
          field2: {
              parse: d => d + ' x'
          },
          field3: {
              parse: d => d + ' y'
          }
        };

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly('pages.some-section.summary-item');
        req.translate.should.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'item title',
          editFieldsIndividually: true,
          editHeader: false,
          changeRoute: 'step-1',
          fields: [
            {
              field: 'field1',
              header: 'field 1 display',
              subroute: 'step-1',
              value: 'badger a'
            },
            {
              field: 'field2',
              header: 'field 2 display',
              subroute: 'step-1',
              value: 'monkeys x'
            },
            {
              field: 'field3',
              header: 'field 3 display',
              subroute: 'step-2',
              value: 'meerkat y'
            }
          ]
        }]);
      });

      it('should respect `omitFromSummary` flag', () => {
        const items = [
          {
            field1: 'badger',
            field2: 'monkeys',
            field3: 'meerkat'
          }
        ];
        options.fieldsConfig = {
          field1: {
              omitFromSummary: true
          },
          field2: {
          },
          field3: {
          }
        };

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly('pages.some-section.summary-item');
        req.translate.should.not.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'item title',
          editFieldsIndividually: true,
          editHeader: false,
          changeRoute: 'step-1',
          fields: [
            {
              field: 'field2',
              header: 'field 2 display',
              subroute: 'step-1',
              value: 'monkeys'
            },
            {
              field: 'field3',
              header: 'field 3 display',
              subroute: 'step-2',
              value: 'meerkat'
            }
          ]
        }]);
      });
    });

    describe('with headerField set', () => {
      before(() => {
        loop.itemTable = {
          headerField: 'field2'
        };
      });

      after(() => {
        delete loop.itemTable;
      });

      it('should create appropriate summaries for a single item', () => {
        const items = [
          {
            field1: 'badger',
            field2: 'monkeys',
            field3: 'meerkat'
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'monkeys',
          editFieldsIndividually: true,
          editHeader: true,
          changeRoute: 'step-1',
          fields: [
            {
              field: 'field1',
              header: 'field 1 display',
              subroute: 'step-1',
              value: 'badger'
            },
            {
              field: 'field3',
              header: 'field 3 display',
              subroute: 'step-2',
              value: 'meerkat'
            }
          ]
        }]);
      });

      it('should create appropriate summaries for multiple items', () => {
        const items = [
          {
            field1: 'badger',
            field2: 'monkeys',
            field3: 'meerkat'
          },
          {
            field1: 'donkey',
            field2: 'rabbit',
            field3: 'giraffe'
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([
          {
            id: 0,
            deleteRoute: 'step-1',
            itemTitle: 'monkeys',
            editFieldsIndividually: true,
            editHeader: true,
            changeRoute: 'step-1',
            fields: [
              {
                field: 'field1',
                header: 'field 1 display',
                subroute: 'step-1',
                value: 'badger'
              },
              {
                field: 'field3',
                header: 'field 3 display',
                subroute: 'step-2',
                value: 'meerkat'
              }
            ]
          },
          {
            id: 1,
            deleteRoute: 'step-1',
            itemTitle: 'rabbit',
            editFieldsIndividually: true,
            editHeader: true,
            changeRoute: 'step-1',
            fields: [
              {
                field: 'field1',
                header: 'field 1 display',
                subroute: 'step-1',
                value: 'donkey'
              },
              {
                field: 'field3',
                header: 'field 3 display',
                subroute: 'step-2',
                value: 'giraffe'
              }
            ]
          }
        ]);
      });

      it('should set editFieldsIndividually to false if there are no fields left to display', () => {
        const items = [
          {
            field2: 'monkeys'
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'monkeys',
          editFieldsIndividually: false,
          editHeader: true,
          changeRoute: 'step-1',
          fields: []
        }]);
      });
    });

    describe('with editFieldsIndividually set', () => {

      beforeEach(() => {
        loop.itemTable = {};
      });

      afterEach(() => {
        delete loop.itemTable;
      });

      it('should create appropriate summaries when set to true', () => {
        loop.itemTable.editFieldsIndividually = true;
        const items = [
          {
            field1: 'badger',
            field2: 'monkeys',
            field3: 'meerkat'
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly('pages.some-section.summary-item');
        req.translate.should.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'item title',
          editFieldsIndividually: true,
          editHeader: false,
          changeRoute: 'step-1',
          fields: [
            {
              field: 'field1',
              header: 'field 1 display',
              subroute: 'step-1',
              value: 'badger'
            },
            {
              field: 'field2',
              header: 'field 2 display',
              subroute: 'step-1',
              value: 'monkeys'
            },
            {
              field: 'field3',
              header: 'field 3 display',
              subroute: 'step-2',
              value: 'meerkat'
            }
          ]
        }]);
      });

      it('should be overriden to false when headerField is set and there are no fields left to display', () => {
        loop.itemTable.editFieldsIndividually = true;
        loop.itemTable.headerField = 'field2';
        const items = [
          {
            field2: 'monkeys'
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'monkeys',
          editFieldsIndividually: false,
          editHeader: true,
          changeRoute: 'step-1',
          fields: []
        }]);
      });

      it('should create appropriate summaries when set to false', () => {
        loop.itemTable.editFieldsIndividually = false;
        const items = [
          {
            field1: 'badger',
            field2: 'monkeys',
            field3: 'meerkat'
          }
        ];

        req.translate.withArgs('pages.some-section.summary-item').returns('item title');
        req.translate.withArgs(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']).returns('field 1 display');
        req.translate.withArgs(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']).returns('field 2 display');
        req.translate.withArgs(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']).returns('field 3 display');

        const returned = helpers.toDisplayableSummary(req, items, options);

        req.translate.should.have.been.calledWithExactly('pages.some-section.summary-item');
        req.translate.should.have.been.calledWithExactly(['fields.field1.summary', 'fields.field1.label', 'fields.field1.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field2.summary', 'fields.field2.label', 'fields.field2.legend']);
        req.translate.should.have.been.calledWithExactly(['fields.field3.summary', 'fields.field3.label', 'fields.field3.legend']);

        expect(returned).to.deep.equal([{
          id: 0,
          deleteRoute: 'step-1',
          itemTitle: 'item title',
          editFieldsIndividually: false,
          editHeader: false,
          changeRoute: 'step-1',
          fields: [
            {
              field: 'field1',
              header: 'field 1 display',
              subroute: 'step-1',
              value: 'badger'
            },
            {
              field: 'field2',
              header: 'field 2 display',
              subroute: 'step-1',
              value: 'monkeys'
            },
            {
              field: 'field3',
              header: 'field 3 display',
              subroute: 'step-2',
              value: 'meerkat'
            }
          ]
        }]);
      });
    });

  });

});
