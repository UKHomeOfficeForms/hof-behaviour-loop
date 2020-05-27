'use strict';

const mix = require('mixwith').mix;
const Base = require('hof-form-controller');
const SummaryBehaviour = require('../../').SummaryWithLoopItems;
const Model = require('hof-model');

class Controller extends mix(Base).with(SummaryBehaviour) {}

describe('Summary Page Behaviour', () => {
  let controller;
  let req;
  let res;

  beforeEach((done) => {
    req = request({
      translate: sinon.spy((a) => Array.isArray(a) ? a[0] : a),
      sessionModel: new Model()
    });
    res = response({});

    controller = new Controller({
      route: '/foo',
      steps: {
        '/': {

        },
        '/one': {
          fields: ['field-one']
        },
        '/a-loop-step': {
          loop: {
            storeKey: 'my-store-key',
            sectionKey: 'my-section-key',
            subSteps: {
              'sub-step-1': {
                fields: ['another-loop-field']
              },
              'sub-step-2': {
                fields: ['some-loop-field']
              }
            }
          }
        },
        '/two': {
          fields: ['field-two']
        },
        '/done': {}
      }
    });
    controller._configure(req, res, done);
  });

  describe('locals', () => {

    beforeEach(() => {
      sinon.stub(Base.prototype, 'locals').returns({super: true});
    });
    afterEach(() => {
      Base.prototype.locals.restore();
    });

    describe('adds loop sections in to the summary', () => {

      it('should include a loop section at the appropriate position in the summary', () => {
        req.sessionModel.set({
          'field-one': 1,
          'field-two': 2,
          'my-store-key': [
            {
              'some-loop-field': 'a value'
            },
            {
              'some-loop-field': 'another value'
            }
          ]
        });

        // fieldsConfig is provided by the surrounding framework in a real app
        req.form.options.fieldsConfig = {
           'field-one': {
             validate: 'required'
           },
           'field-two': {
             validate: 'required'
           },
           'some-loop-field': {
             validate: 'required'
           }
        };

        const result = controller.locals(req, res);
        expect(result.rows.length).to.equal(3);
        expect(result.rows[0].fields.length).to.equal(1);
        expect(result.rows[0].fields[0].field).to.equal('field-one');
        expect(result.rows[1].fields.length).to.equal(3);
        expect(result.rows[1].fields[0].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[0].label).to.equal('pages.confirm.fields.some-loop-field.label');
        expect(result.rows[1].fields[0].changeLinkDescription).to.equal('pages.confirm.fields.some-loop-field.changeLinkDescription');
        expect(result.rows[1].fields[0].value).to.equal('a value');
        expect(result.rows[1].fields[0].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[0].step).to.equal('/a-loop-step/sub-step-2/0');

        expect(result.rows[1].fields[1]).deep.equal({ spacer: true });

        expect(result.rows[1].fields[2].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[2].label).to.equal('pages.confirm.fields.some-loop-field.label');
        expect(result.rows[1].fields[2].changeLinkDescription).to.equal('pages.confirm.fields.some-loop-field.changeLinkDescription');
        expect(result.rows[1].fields[2].value).to.equal('another value');
        expect(result.rows[1].fields[2].step).to.equal('/a-loop-step/sub-step-2/1');
        expect(result.rows[1].fields[2].spacer).to.be.an('undefined');

        expect(result.rows[2].fields.length).to.equal(1);
        expect(result.rows[2].fields[0].field).to.equal('field-two');
        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.one.header', 'pages.one.header']);
        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.a-loop-step.header', 'pages.a-loop-step.header']);
        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.two.header', 'pages.two.header']);
        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.fields.some-loop-field.label',
                                                               'fields.some-loop-field.summary',
                                                               'fields.some-loop-field.label',
                                                               'fields.some-loop-field.legend'
                                                             ]);
        expect(req.translate).to.have.been.calledWithExactly([
                                                               'pages.confirm.fields.some-loop-field.changeLinkDescription',
                                                               'fields.some-loop-field.changeLinkDescription',
                                                               'pages.confirm.fields.some-loop-field.label',
                                                               'fields.some-loop-field.summary',
                                                               'fields.some-loop-field.label',
                                                               'fields.some-loop-field.legend'
                                                             ]);
      });

      it('should use the supplied section config to retrieve the parse function for loop sections if provided', () => {
        req.sessionModel.set({
          'field-one': 1,
          'field-two': 2,
          'my-store-key': [
            {
              'some-loop-field': 'a value'
            },
            {
              'some-loop-field': 'another value'
            }
          ]
        });

        // fieldsConfig is provided by the surrounding framework in a real app
        req.form.options.fieldsConfig = {
           'field-one': {
             validate: 'required'
           },
           'field-two': {
             validate: 'required'
           },
           'some-loop-field': {
             validate: 'required'
           }
        };
        req.form.options.sections = {
          'section-one': ['field-one', 'field-two'],
          'a-loop-step': [{field: 'some-loop-field', parse: v => v ? v + ' x' : v, step: 'something'}]
        };

        const result = controller.locals(req, res);
        expect(result.rows.length).to.equal(2);
        expect(result.rows[0].fields.length).to.equal(2);
        expect(result.rows[0].fields[0].field).to.equal('field-one');
        expect(result.rows[0].fields[1].field).to.equal('field-two');

        expect(result.rows[1].fields.length).to.equal(3);
        expect(result.rows[1].fields[0].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[0].value).to.equal('a value x');
        expect(result.rows[1].fields[0].step).to.equal('/a-loop-step/sub-step-2/0');

        expect(result.rows[1].fields[0].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[1].field).to.be.an('undefined');
        expect(result.rows[1].fields[1].value).to.be.an('undefined');
        expect(result.rows[1].fields[1].spacer).to.equal(true);
        expect(result.rows[1].fields[2].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[2].value).to.equal('another value x');
        expect(result.rows[1].fields[2].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[2].step).to.equal('/a-loop-step/sub-step-2/1');

        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.section-one.header', 'pages.section-one.header']);
        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.a-loop-step.header', 'pages.a-loop-step.header']);
      });

      it('should use the value as supplied if no parse function present in section or field configs', () => {
        req.sessionModel.set({
          'field-one': 1,
          'field-two': 2,
          'my-store-key': [
            {
              'some-loop-field': 'a value'
            },
            {
              'some-loop-field': 'another value'
            }
          ]
        });

        // fieldsConfig is provided by the surrounding framework in a real app
        req.form.options.fieldsConfig = {
           'field-one': {
             validate: 'required'
           },
           'field-two': {
             validate: 'required'
           },
           'some-loop-field': {
             validate: 'required'
           }
        };
        req.form.options.sections = {
          'section-one': ['field-one', 'field-two'],
          'a-loop-step': [{field: 'some-loop-field'}]
        };

        const result = controller.locals(req, res);
        expect(result.rows.length).to.equal(2);
        expect(result.rows[0].fields.length).to.equal(2);
        expect(result.rows[0].fields[0].field).to.equal('field-one');
        expect(result.rows[0].fields[1].field).to.equal('field-two');

        expect(result.rows[1].fields.length).to.equal(3);
        expect(result.rows[1].fields[0].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[0].value).to.equal('a value');
        expect(result.rows[1].fields[0].step).to.equal('/a-loop-step/sub-step-2/0');

        expect(result.rows[1].fields[0].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[1].field).to.be.an('undefined');
        expect(result.rows[1].fields[1].value).to.be.an('undefined');
        expect(result.rows[1].fields[1].spacer).to.equal(true);
        expect(result.rows[1].fields[2].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[2].value).to.equal('another value');
        expect(result.rows[1].fields[2].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[2].step).to.equal('/a-loop-step/sub-step-2/1');

        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.section-one.header', 'pages.section-one.header']);
        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.a-loop-step.header', 'pages.a-loop-step.header']);
      });

      it('should exclude section if a section config is provided and this section is not part of it', () => {
        req.sessionModel.set({
          'field-one': 1,
          'field-two': 2,
          'my-store-key': [
            {
              'some-loop-field': 'a value'
            },
            {
              'some-loop-field': 'another value'
            }
          ]
        });

        // fieldsConfig is provided by the surrounding framework in a real app
        req.form.options.fieldsConfig = {
           'field-one': {
             validate: 'required'
           },
           'field-two': {
             validate: 'required'
           },
           'some-loop-field': {
             validate: 'required'
           }
        };
        req.form.options.sections = {
          'section-one': ['field-one', 'field-two']
        };

        const result = controller.locals(req, res);
        expect(result.rows.length).to.equal(1);
        expect(result.rows[0].fields.length).to.equal(2);
        expect(result.rows[0].fields[0].field).to.equal('field-one');
        expect(result.rows[0].fields[1].field).to.equal('field-two');

        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.section-one.header', 'pages.section-one.header']);
      });

      it('should use the parse function from field config if available and section config has a string  for the field', () => {
        req.sessionModel.set({
          'field-one': 1,
          'field-two': 2,
          'my-store-key': [
            {
              'some-loop-field': 'a value'
            },
            {
              'some-loop-field': 'another value'
            }
          ]
        });

        // fieldsConfig is provided by the surrounding framework in a real app
        req.form.options.fieldsConfig = {
           'field-one': {
             validate: 'required'
           },
           'field-two': {
             validate: 'required'
           },
           'some-loop-field': {
             validate: 'required',
             parse: v => v ? v + ' x' : v
           }
        };
        req.form.options.sections = {
          'section-one': ['field-one', 'field-two'],
          'a-loop-step': ['some-loop-field']
        };

        const result = controller.locals(req, res);
        expect(result.rows.length).to.equal(2);
        expect(result.rows[0].fields.length).to.equal(2);
        expect(result.rows[0].fields[0].field).to.equal('field-one');
        expect(result.rows[0].fields[1].field).to.equal('field-two');

        expect(result.rows[1].fields.length).to.equal(3);
        expect(result.rows[1].fields[0].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[0].value).to.equal('a value x');
        expect(result.rows[1].fields[0].step).to.equal('/a-loop-step/sub-step-2/0');

        expect(result.rows[1].fields[0].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[1].field).to.be.an('undefined');
        expect(result.rows[1].fields[1].value).to.be.an('undefined');
        expect(result.rows[1].fields[1].spacer).to.equal(true);
        expect(result.rows[1].fields[2].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[2].value).to.equal('another value x');
        expect(result.rows[1].fields[2].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[2].step).to.equal('/a-loop-step/sub-step-2/1');

        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.section-one.header', 'pages.section-one.header']);
        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.a-loop-step.header', 'pages.a-loop-step.header']);
      });

      it('should use the parse function from field config if available and section config for the field', () => {
        req.sessionModel.set({
          'field-one': 1,
          'field-two': 2,
          'my-store-key': [
            {
              'some-loop-field': 'a value'
            },
            {
              'some-loop-field': 'another value'
            }
          ]
        });

        // fieldsConfig is provided by the surrounding framework in a real app
        req.form.options.fieldsConfig = {
           'field-one': {
             validate: 'required'
           },
           'field-two': {
             validate: 'required'
           },
           'some-loop-field': {
             validate: 'required',
             parse: v => v ? v + ' x' : v
           }
        };
        req.form.options.sections = {
          'section-one': ['field-one', 'field-two'],
          'a-loop-step': [{field: 'some-loop-field'}]
        };

        const result = controller.locals(req, res);
        expect(result.rows.length).to.equal(2);
        expect(result.rows[0].fields.length).to.equal(2);
        expect(result.rows[0].fields[0].field).to.equal('field-one');
        expect(result.rows[0].fields[1].field).to.equal('field-two');

        expect(result.rows[1].fields.length).to.equal(3);
        expect(result.rows[1].fields[0].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[0].value).to.equal('a value x');
        expect(result.rows[1].fields[0].step).to.equal('/a-loop-step/sub-step-2/0');

        expect(result.rows[1].fields[0].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[1].field).to.be.an('undefined');
        expect(result.rows[1].fields[1].value).to.be.an('undefined');
        expect(result.rows[1].fields[1].spacer).to.equal(true);
        expect(result.rows[1].fields[2].field).to.equal('some-loop-field');
        expect(result.rows[1].fields[2].value).to.equal('another value x');
        expect(result.rows[1].fields[2].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[2].step).to.equal('/a-loop-step/sub-step-2/1');

        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.section-one.header', 'pages.section-one.header']);
        expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.a-loop-step.header', 'pages.a-loop-step.header']);
      });

      it('should respect omitFromSummary flag if presented in the fields config', () => {
        req.sessionModel.set({
          'field-one': 1,
          'field-two': 2,
          'my-store-key': [
            {
              'some-loop-field': 'a value',
              'another-loop-field': 'a value 2'
            },
            {
              'some-loop-field': 'another value',
              'another-loop-field': 'another value 2'
            }
          ]
        });

        // fieldsConfig is provided by the surrounding framework in a real app
        req.form.options.fieldsConfig = {
           'field-one': {
             validate: 'required'
           },
           'field-two': {
             validate: 'required'
           },
           'some-loop-field': {
             validate: 'required',
             omitFromSummary: true
           },
           'another-loop-field': {
             validate: 'required'
           }
        };
        delete req.form.options.sections;

        const result = controller.locals(req, res);
        expect(result.rows.length).to.equal(3);
        expect(result.rows[0].fields.length).to.equal(1);
        expect(result.rows[0].fields[0].field).to.equal('field-one');

        expect(result.rows[1].fields.length).to.equal(3);
        expect(result.rows[1].fields[0].field).to.equal('another-loop-field');
        expect(result.rows[1].fields[0].value).to.equal('a value 2');
        expect(result.rows[1].fields[0].step).to.equal('/a-loop-step/sub-step-1/0');

        expect(result.rows[1].fields[0].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[1].field).to.be.an('undefined');
        expect(result.rows[1].fields[1].value).to.be.an('undefined');
        expect(result.rows[1].fields[1].spacer).to.equal(true);
        expect(result.rows[1].fields[2].field).to.equal('another-loop-field');
        expect(result.rows[1].fields[2].value).to.equal('another value 2');
        expect(result.rows[1].fields[2].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[2].step).to.equal('/a-loop-step/sub-step-1/1');

        expect(result.rows[2].fields.length).to.equal(1);
        expect(result.rows[2].fields[0].field).to.equal('field-two');
      });

      it('should respect applySpacer override if presented in loop config', () => {
        req.sessionModel.set({
          'field-one': 1,
          'field-two': 2,
          'my-store-key': [
            {
              'some-loop-field': 'a value',
              'another-loop-field': 'a value 2'
            },
            {
              'some-loop-field': 'another value',
              'another-loop-field': 'another value 2'
            }
          ]
        });

        // fieldsConfig is provided by the surrounding framework in a real app
        req.form.options.fieldsConfig = {
           'field-one': {
             validate: 'required'
           },
           'field-two': {
             validate: 'required'
           },
           'some-loop-field': {
             validate: 'required',
             omitFromSummary: true
           },
           'another-loop-field': {
             validate: 'required'
           }
        };
        req.form.options.steps['/a-loop-step'].loop.summary = {applySpacer: false};

        const result = controller.locals(req, res);
        expect(result.rows.length).to.equal(3);
        expect(result.rows[0].fields.length).to.equal(1);
        expect(result.rows[0].fields[0].field).to.equal('field-one');

        expect(result.rows[1].fields.length).to.equal(2);
        expect(result.rows[1].fields[0].field).to.equal('another-loop-field');
        expect(result.rows[1].fields[0].value).to.equal('a value 2');
        expect(result.rows[1].fields[0].step).to.equal('/a-loop-step/sub-step-1/0');
        expect(result.rows[1].fields[0].spacer).to.be.an('undefined');

        expect(result.rows[1].fields[1].field).to.equal('another-loop-field');
        expect(result.rows[1].fields[1].value).to.equal('another value 2');
        expect(result.rows[1].fields[1].spacer).to.be.an('undefined');
        expect(result.rows[1].fields[1].step).to.equal('/a-loop-step/sub-step-1/1');

        expect(result.rows[2].fields.length).to.equal(1);
        expect(result.rows[2].fields[0].field).to.equal('field-two');
      });

    });

  });

});
