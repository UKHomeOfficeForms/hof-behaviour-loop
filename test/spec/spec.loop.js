'use strict';

const LoopBehaviour = require('../../').Loop;
const Controller = require('hof-form-controller').Controller;
const Loop = LoopBehaviour(Controller);

describe('Loop behaviour', () => {

  describe('constructor', () => {
    it('should default the fields value to all of the sub-step fields if none are specified', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
           field0: {
             validate: 'required'
           },
           field1: {
             validate: 'required'
           },
           field2: {
             omitFromSummary: true
           },
           field3: {
             omitFromSummary: true
           },
           field4: {
             omitFromSummary: true
           },
           field5: {
             omitFromSummary: true
           }
        },
        loopData: {
        },
        subSteps: {
          something: {
            fields: ['field1'],
            next: 'step2'
          },
          step2: {
            fields: ['field2'],
            next: 'add-another'
          },
          'add-another': {
            fields: ['field3', 'field4']
          }
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.options.fields).to.deep.equal(
        {
          field1: options.fieldsConfig.field1,
          field2: options.fieldsConfig.field2,
          field3: options.fieldsConfig.field3,
          field4: options.fieldsConfig.field4
        }
      );
      /* we want the original value to be modified so that any other modules relying on the fields config get
       * the right values
      */
      expect(options.fields).to.equal(loop.options.fields);
    });

    it('should default the fields value to all of the sub-step fields if an empty map is provided', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
           field0: {
             validate: 'required'
           },
           field1: {
             validate: 'required'
           },
           field2: {
             omitFromSummary: true
           },
           field3: {
             omitFromSummary: true
           },
           field4: {
             omitFromSummary: true
           },
           field5: {
             omitFromSummary: true
           }
        },
        fields: {},
        loopData: {
        },
        subSteps: {
          something: {
            fields: ['field1'],
            next: 'step2'
          },
          step2: {
            fields: ['field2'],
            next: 'add-another'
          },
          'add-another': {
            fields: ['field3', 'field4']
          }
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.options.fields).to.deep.equal(
        {
          field1: options.fieldsConfig.field1,
          field2: options.fieldsConfig.field2,
          field3: options.fieldsConfig.field3,
          field4: options.fieldsConfig.field4
        }
      );
      /* we want the original value to be modified so that any other modules relying on the fields config get
       * the right values
      */
      expect(options.fields).to.equal(loop.options.fields);
    });

    it('should handle no sub steps', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
           field0: {
             validate: 'required'
           },
           field1: {
             validate: 'required'
           },
           field2: {
             omitFromSummary: true
           },
           field3: {
             omitFromSummary: true
           },
           field4: {
             omitFromSummary: true
           },
           field5: {
             omitFromSummary: true
           }
        },
        fields: {},
        loopData: {
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.options.fields).to.deep.equal({});
      expect(options.fields).to.deep.equal({});
    });

    it('should not overwrite the fields value if they are already specified', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
           field0: {
             validate: 'required'
           },
           field1: {
             validate: 'required'
           },
           field2: {
             omitFromSummary: true
           },
           field3: {
             omitFromSummary: true
           },
           field4: {
             omitFromSummary: true
           },
           field5: {
             omitFromSummary: true
           }
        },
        fields: {
           field1: {
             validate: 'required'
           },
           field2: {
             omitFromSummary: true
           },
           field3: {
             omitFromSummary: true
           },
           field4: {
             omitFromSummary: true
           }
        },
        loopData: {
        },
        subSteps: {
          something: {
            fields: ['field1'],
            next: 'step2'
          },
          step2: {
            fields: ['field2'],
            next: 'add-another'
          },
          'add-another': {
            fields: ['field3', 'field4']
          }
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.options.fields).to.deep.equal(
        {
          field1: {
            validate: 'required'
          },
          field2: {
            omitFromSummary: true
          },
          field3: {
            omitFromSummary: true
          },
          field4: {
            omitFromSummary: true
          }
        }
      );
      expect(options.fields).to.equal(loop.options.fields);
    });

    it('should default the storeKey attribute to `items` if not provided', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
        },
        loopData: {
        },
        subSteps: {
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.options.loopData.storeKey).to.equal('items');
      // we want the original value to be modified so that the summary module gets the right key
      expect(options.loopData.storeKey).to.equal(loop.options.loopData.storeKey);
    });

    it('should not overwrite the storeKey attribute if provided', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
        },
        loopData: {
          storeKey: 'monkeys'
        },
        subSteps: {
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.options.loopData.storeKey).to.equal('monkeys');
    });

    it('should default the sectionKey attribute based on the route if not provided', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
        },
        loopData: {
        },
        subSteps: {
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.options.loopData.sectionKey).to.equal('badgers');
      // we want the original value to be modified so that the summary module gets the right key
      expect(options.loopData.sectionKey).to.equal(loop.options.loopData.sectionKey);
    });

    it('should overwrite the sectionKey attribute if provided', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
        },
        loopData: {
          sectionKey: 'monkeys'
        },
        subSteps: {
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.options.loopData.sectionKey).to.equal('badgers');
    });

    it('should take confirmStep from loopData', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
        },
        loopData: {
          confirmStep: '/monkeys'
        },
        subSteps: {
        },
        route: '/badgers'
      };
      const loop = new Loop(options);
      expect(loop.confirmStep).to.equal('/monkeys');
    });

  });

  describe('configure', () => {
    it('should restrict the set of request fields to only those configured for this sub step', () => {
      const options = {
        // fieldsConfig is provided by the surrounding framework in a real app
        fieldsConfig: {
          field0: {
            validate: 'required'
          },
          field1: {
            validate: 'required'
          },
          field2: {
            omitFromSummary: true
          },
          field3: {
            omitFromSummary: true
          },
          field4: {
            omitFromSummary: true
          },
          field5: {
            omitFromSummary: true
          }
        },
        loopData: {
        },
        subSteps: {
          something: {
            fields: ['field1'],
            next: 'step2'
          },
          step2: {
            fields: ['field2', 'field3'],
            next: 'add-another'
          },
          'add-another': {
            fields: ['field4']
          }
        },
        route: '/badgers'
      };

      let req = request({});
      req.form.options.fields = {
        field1: {
          validate: 'required'
        },
        field2: {
          omitFromSummary: true
        },
        field3: {
          omitFromSummary: true
        },
        field4: {
          omitFromSummary: true
        }
      };
      req.params.action = 'step2';

      let res = response({});

      const loop = new Loop(options);
      const callback = sinon.spy();
      loop.configure(req, res, callback);

      expect(req.form.options.fields).to.deep.equal({
        field2: {
          omitFromSummary: true
        },
        field3: {
          omitFromSummary: true
        }
      });
      callback.should.have.been.calledOnce;
    });
  });

  describe('configured behaviour', () => {
    let options;
    let req;
    let res;
    let callback;
    let loop;

    beforeEach(() => {
      options = {
        fieldsConfig: {
          field1: {
            validate: 'required'
          },
          field2: {
            omitFromSummary: true
          },
          field3: {
            omitFromSummary: true
          }
        },
        loopData: {
          confirmStep: '/confirm'
        },
        subSteps: {
          something: {
            fields: ['field1'],
            next: 'step2'
          },
          step2: {
            fields: ['field2'],
            next: 'add-another',
            forks: [
              {
                target: 'forkedStep',
                  condition: {
                    field: 'field2',
                    value: 'fork it!'
                }
              }
            ]
          },
          forkedStep: {
            fields: ['field4'],
            next: 'add-another'
          },
          'add-another': {
            fields: ['field3']
          }
        },
        route: '/badgers'
      };
      req = request({});
      res = response({});
      callback = sinon.stub();

      req.form.options = options;
      loop = new Loop(options);
    });

    describe('get', () => {
        const superGet = sinon.stub(Controller.prototype, 'get');

        beforeEach(()=> {
          superGet.reset();
        });

        after(()=> {
          superGet.restore();
        });

        describe('accessing the top-level step', () => {
           it('should show the first step when there are no items', () => {
              req.sessionModel.get.onFirstCall().returns(undefined);

              loop.get(req, res, callback);

              res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/something');
              callback.should.not.have.been.called;
           });

           it('should show the first step when there is empty items', () => {
              req.sessionModel.get.onFirstCall().returns([]);

              loop.get(req, res, callback);

              res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/something');
              callback.should.not.have.been.called;
           });

           it('should redirect to the first step correctly when baseUrl and route have trailing slashes', () => {
             options.route = '/badgers/';
             req.baseUrl = '/app/';
             req.sessionModel.get.onFirstCall().returns(undefined);

             loop.get(req, res, callback);

             res.redirect.should.have.been.calledOnce
                .and.calledWithExactly('/app/badgers/something');
             callback.should.not.have.been.called;
           });

           it('should show the final step when there are already items', () => {
             req.sessionModel.get.onFirstCall().returns([{}]);

             loop.get(req, res, callback);

             res.redirect.should.have.been.calledOnce
                .and.calledWithExactly('/app/badgers/add-another');
             callback.should.not.have.been.called;
           });
        });

        describe('accessing a non-existent sub-step', () => {
           it('should show the first step when there are no items', () => {
              req.sessionModel.get.onFirstCall().returns(undefined);
              req.params.action = 'monkeys';

              loop.get(req, res, callback);

              res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/something');
              callback.should.not.have.been.called;
           });

           it('should show the first step when there is empty items', () => {
              req.sessionModel.get.onFirstCall().returns([]);
              req.params.action = 'monkeys';

              loop.get(req, res, callback);

              res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/something');
              callback.should.not.have.been.called;
           });

           it('should redirect to the first step correctly when baseUrl and route have trailing slashes', () => {
             options.route = '/badgers/';
             req.baseUrl = '/app/';
             req.sessionModel.get.onFirstCall().returns(undefined);
             req.params.action = 'monkeys';

             loop.get(req, res, callback);

             res.redirect.should.have.been.calledOnce
                .and.calledWithExactly('/app/badgers/something');
             callback.should.not.have.been.called;
           });

           it('should show the final step when there are already items', () => {
             req.sessionModel.get.onFirstCall().returns([{}]);

             loop.get(req, res, callback);

             res.redirect.should.have.been.calledOnce
                .and.calledWithExactly('/app/badgers/add-another');
             callback.should.not.have.been.called;
           });
        });

        describe('accessing a sub-step before its prerequisites are satisfied', () => {
           beforeEach(() => {
             options.subSteps.step2.prereqs = 'someField';
             req.params.action = 'step2';
             req.sessionModel.get.withArgs('someField').returns(undefined);
           });

           it('should show the first step when there are no items', () => {
              req.sessionModel.get.withArgs('items').returns(undefined);

              loop.get(req, res, callback);

              res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/something');
              callback.should.not.have.been.called;
           });
           it('should show the first step when there is empty items', () => {
              req.sessionModel.get.withArgs('items').returns([]);

              loop.get(req, res, callback);

              res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/something');
              callback.should.not.have.been.called;
           });

           it('should redirect to the first step correctly when baseUrl and route have trailing slashes', () => {
             options.route = '/badgers/';
             req.baseUrl = '/app/';
             req.sessionModel.get.withArgs('items').returns(undefined);

             loop.get(req, res, callback);

             res.redirect.should.have.been.calledOnce
                .and.calledWithExactly('/app/badgers/something');
             callback.should.not.have.been.called;
           });

           it('should show the final step when there are already items', () => {
             req.sessionModel.get.withArgs('items').returns([{}]);

             loop.get(req, res, callback);

             res.redirect.should.have.been.calledOnce
                .and.calledWithExactly('/app/badgers/add-another');
             callback.should.not.have.been.called;
           });

           it('should delegate to the superclass get (showing the step) when in the change flow', () => {
             req.params.edit = 'change';
             superGet.returns('/app/badgers/step2/0/change');

             const returned = loop.get(req, res, callback);

             superGet.should.have.been.calledOnce
               .and.calledWithExactly(req, res, callback);
             expect(returned).to.equal('/app/badgers/step2/0/change');
             callback.should.not.have.been.called;
             res.redirect.should.not.have.been.called;
           });

           it('should delegate to the superclass get (showing the step) when in the edit flow', () => {
             req.params.edit = 'edit';
             superGet.returns('/app/badgers/step2/0/edit');

             const returned = loop.get(req, res, callback);

             superGet.should.have.been.calledOnce
                        .and.calledWithExactly(req, res, callback);
             expect(returned).to.equal('/app/badgers/step2/0/edit');
             callback.should.not.have.been.called;
             res.redirect.should.not.have.been.called;
           });

        });

        describe('accessing a sub-step when its prerequisites are satisfied', () => {
           beforeEach(() => {
             options.subSteps.step2.prereqs = 'someField';
             req.params.action = 'step2';
             req.sessionModel.get.withArgs('someField').returns('something');
           });

           it('should delegate to the superclass in normal flow', () => {
             superGet.returns('/app/badgers/step2');

             const returned = loop.get(req, res, callback);

             superGet.should.have.been.calledOnce
               .and.calledWithExactly(req, res, callback);
             expect(returned).to.equal('/app/badgers/step2');
             callback.should.not.have.been.called;
             res.redirect.should.not.have.been.called;
           });

           it('should delegate to the superclass get (showing the step) when in the change flow', () => {
             req.params.edit = 'change';
             superGet.returns('/app/badgers/step2/0/change');

             const returned = loop.get(req, res, callback);

             superGet.should.have.been.calledOnce
               .and.calledWithExactly(req, res, callback);
             expect(returned).to.equal('/app/badgers/step2/0/change');
             callback.should.not.have.been.called;
             res.redirect.should.not.have.been.called;
           });

           it('should delegate to the superclass get (showing the step) when in the edit flow', () => {
             req.params.edit = 'edit';
             superGet.returns('/app/badgers/step2/0/edit');

             const returned = loop.get(req, res, callback);

             superGet.should.have.been.calledOnce
                        .and.calledWithExactly(req, res, callback);
             expect(returned).to.equal('/app/badgers/step2/0/edit');
             callback.should.not.have.been.called;
             res.redirect.should.not.have.been.called;
           });
        });

        describe('accessing a sub-step without prerequisites', () => {
           beforeEach(() => {
             req.params.action = 'step2';
           });

           it('should delegate to the superclass in normal flow', () => {
             superGet.returns('/app/badgers/step2');

             const returned = loop.get(req, res, callback);

             superGet.should.have.been.calledOnce
               .and.calledWithExactly(req, res, callback);
             expect(returned).to.equal('/app/badgers/step2');
             callback.should.not.have.been.called;
             res.redirect.should.not.have.been.called;
           });

           it('should delegate to the superclass get (showing the step) when in the change flow', () => {
             req.params.edit = 'change';
             superGet.returns('/app/badgers/step2/0/change');

             const returned = loop.get(req, res, callback);

             superGet.should.have.been.calledOnce
               .and.calledWithExactly(req, res, callback);
             expect(returned).to.equal('/app/badgers/step2/0/change');
             callback.should.not.have.been.called;
             res.redirect.should.not.have.been.called;
           });

           it('should delegate to the superclass get (showing the step) when in the edit flow', () => {
             req.params.edit = 'edit';
             superGet.returns('/app/badgers/step2/0/edit');

             const returned = loop.get(req, res, callback);

             superGet.should.have.been.calledOnce
                        .and.calledWithExactly(req, res, callback);
             expect(returned).to.equal('/app/badgers/step2/0/edit');
             callback.should.not.have.been.called;
             res.redirect.should.not.have.been.called;
           });
        });

        describe('nastily deleting stuff if the edit action is `delete` and an index is provided', () => {
           beforeEach(() => {
             req.params.edit = 'delete';
             req.params.id = '0';
           });

           const steps = [
             {description: 'first', name: 'something'},
             {description: 'second', name: 'step2'},
             {description: 'final', name: 'add-another'}
           ];

           steps.forEach(function(step) {
             it('should delete items from ' + step.description + ' step link and redirect to last step if there are more items', function() {
               const originalItems = [{}, {}];
               req.sessionModel.get.withArgs('items').returns(originalItems.slice());
               req.params.action = step.name;

               loop.get(req, res, callback);

               req.sessionModel.set.should.have.been.calledOnce
                 .and.calledWithExactly('items', [originalItems[1]]);

               superGet.should.not.have.been.called;
               callback.should.not.have.been.called;
               res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/add-another');
             });

             it('should delete non-zero-indexed items from ' + step.description + ' step link and redirect to last step', function() {
               req.params.id = '1';
               const originalItems = [{}, {}];
               req.sessionModel.get.withArgs('items').returns(originalItems.slice());
               req.params.action = step.name;

               loop.get(req, res, callback);

               req.sessionModel.set.should.have.been.calledOnce
                 .and.calledWithExactly('items', [originalItems[0]]);

               superGet.should.not.have.been.called;
               callback.should.not.have.been.called;
               res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/add-another');
             });

             it('should delete items from ' + step.description + ' step link and redirect to first step if there are no more items', function() {
               const originalItems = [{}];
               req.sessionModel.get.withArgs('items').returns(originalItems.slice());
               req.params.action = step.name;

               loop.get(req, res, callback);

               req.sessionModel.set.should.have.been.calledOnce
                 .and.calledWithExactly('items', []);

               superGet.should.not.have.been.called;
               callback.should.not.have.been.called;
               res.redirect.should.have.been.calledOnce
                 .and.calledWithExactly('/app/badgers/something');
             });
           });
        });
      });

      describe('getBackLink', () => {
        const superGetBackLink = sinon.stub(Controller.prototype, 'getBackLink');

        beforeEach(() => {
          superGetBackLink.reset();
        });

        after(() => {
          superGetBackLink.restore();
        });

        it('should return the result from super.getBackLink if this is the first visit to the first step', () => {
          req.sessionModel.get.withArgs('subSteps').returns(undefined);
          req.params.action = 'something';

          superGetBackLink.withArgs(req, res).returns('/monkeys');

          const returned = loop.getBackLink(req, res);

          expect(returned).to.equal('/monkeys');
        });

        it('should return the result from super.getBackLink if empty array of seen steps', () => {
          req.sessionModel.get.withArgs('subSteps').returns([]);
          req.params.action = 'something';

          superGetBackLink.withArgs(req, res).returns('/monkeys');

          const returned = loop.getBackLink(req, res);

          expect(returned).to.equal('/monkeys');
        });

        it('should return relative path to previous step for later step', ()=>{
          req.sessionModel.get.withArgs('subSteps').returns(['something']);
          req.params.action = 'step2';
          options.route = 'badgers';

          const returned = loop.getBackLink(req, res);

          expect(returned).to.equal('badgers/something');
        });

        it('should return relative path to previous step for later step when route has leading /', ()=>{
          req.sessionModel.get.withArgs('subSteps').returns(['something']);
          req.params.action = 'step2';
          options.route = '/badgers';

          const returned = loop.getBackLink(req, res);

          expect(returned).to.equal('badgers/something');
        });

        it('should return the result from super.getBackLink if this is the final / summary step', () => {
          req.sessionModel.get.withArgs('subSteps').returns(undefined);
          req.params.action = 'add-another';

          superGetBackLink.withArgs(req, res).returns('/monkeys');

          const returned = loop.getBackLink(req, res);

          expect(returned).to.equal('/monkeys');
        });

        it('should return relative path to final step for first step when we have been round the loop before', () => {
          req.sessionModel.get.withArgs('subSteps').returns(Object.keys(options.subSteps));
          req.params.action = 'something';

          const returned = loop.getBackLink(req, res);

          expect(returned).to.equal('badgers/add-another');
        });

        it('should return relative path to previous step for later step when we have been round the loop before', ()=>{
          req.sessionModel.get.withArgs('subSteps').returns(Object.keys(options.subSteps));
          req.params.action = 'step2';

          const returned = loop.getBackLink(req, res);

          expect(returned).to.equal('badgers/something');
        });
      });

      describe('getNextStep', () => {
        const superGetNextStep = sinon.stub(Controller.prototype, 'getNextStep');

        const steps = [
          {description: 'first', name: 'something', followingStep: 'step2'},
          {description: 'second', name: 'step2', followingStep: 'add-another'},
          {description: 'final', name: 'add-another'}
        ];

        beforeEach(() => {
          superGetNextStep.reset();
        });

        after(() => {
          superGetNextStep.restore();
        });

        steps.forEach(function(step) {
          it('should return to confirm step when editing ' + step.description + ' step', function() {
            req.params.action = step.name;
            req.params.edit = 'edit';

            const returned = loop.getNextStep(req, res);

            expect(returned).to.equal('/app/confirm');
          });

          it('should handle trailing / from baseUrl when editing ' + step.description + ' step', function() {
            req.params.action = step.name;
            req.params.edit = 'edit';
            req.baseUrl = '/app/';

            const returned = loop.getNextStep(req, res);

            expect(returned).to.equal('/app/confirm');
          });

          it('should return to final step when changing ' + step.description + ' step', function() {
            req.params.action = step.name;
            req.params.edit = 'change';
            req.form.options.route = options.route;
            req.form.options.subSteps = options.subSteps;
            req.url = options.route + '/' + step.name;

            const returned = loop.getNextStep(req, res);

            expect(returned).to.equal('/app/badgers/add-another');
          });

          it('should handle trailing / from baseUrl when changing ' + step.description + ' step', function() {
            req.baseUrl = '/app/';
            req.params.action = step.name;
            req.params.edit = 'change';
            req.form.options.route = options.route;
            req.form.options.subSteps = options.subSteps;
            req.url = options.route + '/' + step.name;

            const returned = loop.getNextStep(req, res);

            expect(returned).to.equal('/app/badgers/add-another');
          });
        });

        const allExceptTheFinalStep = steps.splice(0, 2);
        allExceptTheFinalStep.forEach(function(step) {
          it('should return the following step for ' + step.description + ' step when there are no forks', function() {
            req.params.action = step.name;
            req.url = options.route + '/' + step.name;
            req.form.options.subSteps = options.subSteps;
            req.form.options.next = step.followingStep;

            const returned = loop.getNextStep(req, res);

            expect(returned).to.equal('/app/badgers/' + step.followingStep);
          });

          it('should handle leading / from next step with trailing / from baseUrl', function() {
            req.params.action = step.name;
            req.url = options.route + '/' + step.name;
            req.form.options.subSteps = options.subSteps;
            req.form.options.next = '/' + step.followingStep;
            req.baseUrl = '/app/';

            const returned = loop.getNextStep(req, res);

            expect(returned).to.equal('/app/badgers/' + step.followingStep);
          });
        });

        it('should use the fork target when there are forks and the fork condition is met', function() {
          req.params.action = 'step2';
          req.url = options.route + '/step2';
          req.form.options.subSteps = options.subSteps;
          req.form.options.forks = options.subSteps.step2.forks;
          req.form.values.field2 = 'fork it!';
          req.form.options.next = options.subSteps.step2.next;

          const returned = loop.getNextStep(req, res);

          expect(returned).to.equal('/app/badgers/forkedStep');
        });

        it('should use the next value when there are forks and the fork condition is not met', function() {
          req.params.action = 'step2';
          req.url = options.route + '/step2';
          req.form.options.subSteps = options.subSteps;
          req.form.options.forks = options.subSteps.step2.forks;
          req.form.values.field2 = 'do not fork it!';
          req.form.options.next = options.subSteps.step2.next;

          const returned = loop.getNextStep(req, res);

          expect(returned).to.equal('/app/badgers/add-another');
        });

        it('should handle leading / from getForkTarget with trailing / from baseUrl with forks', function() {
          req.baseUrl = '/app/';
          req.params.action = 'step2';
          req.url = options.route + '/step2';
          req.form.options.subSteps = options.subSteps;
          req.form.options.forks = options.subSteps.step2.forks;
          req.form.values.field2 = 'fork it!';
          req.form.options.next = options.subSteps.step2.next;

          const returned = loop.getNextStep(req, res);

          expect(returned).to.equal('/app/badgers/forkedStep');
        });

        it('should return the next top-level step for the final step if there is no loop condition', function() {
          req.params.action = 'add-another';
          superGetNextStep.returns('monkeys');
          req.form.options.subSteps = options.subSteps;

          const returned = loop.getNextStep(req, res);

          expect(returned).to.equal('monkeys');
        });

        it('should return the next top-level step for the final step if the loop condition fails', function() {
          req.params.action = 'add-another';
          superGetNextStep.returns('monkeys');
          req.form.options.subSteps = options.subSteps;
          req.form.options.loopCondition = {
            field: 'field1',
            value: 'yes'
          };

          const returned = loop.getNextStep(req, res);

          expect(returned).to.equal('monkeys');
        });

        it('should return the next step if on the final step and the loopCondition has been met', function() {
          req.params.action = 'add-another';

          req.form.options.subSteps = options.subSteps;
          req.form.options.loopCondition = {
            field: 'field1',
            value: 'yes'
          };
          req.form.values.field1 = 'yes';
          req.url = '/badgers/add-another';

          const returned = loop.getNextStep(req, res);

          expect(returned).to.equal('/app/badgers/something');
        });

        it('should handle trailing / from baseUrl when loopCondition is met', function() {
          req.params.action = 'add-another';

          req.form.options.subSteps = options.subSteps;
          req.form.options.loopCondition = {
            field: 'field1',
            value: 'yes'
          };
          req.form.values.field1 = 'yes';
          req.baseUrl = '/app/';
          req.url = '/badgers/add-another';

          const returned = loop.getNextStep(req, res);

          expect(returned).to.equal('/app/badgers/something');
        });
      });

      describe('saveValues', () => {
        const superSaveValues = sinon.stub(Controller.prototype, 'saveValues');

        beforeEach(() => {
          superSaveValues.reset();
          superSaveValues.callThrough();
        });

        after(() => {
          superSaveValues.restore();
        });

        describe('when editing an existing item', () => {
          it('should store any provided form values into the specified item', () => {

            req.form.values = {
              field1: 'something',
              field2: 'somethingElse'
            };
            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'initial'
              },
              {
                field1: 'badger'
              },
              {
                field1: 'badger2'
              }
            ]);
            req.params.id = '1';
            callback.returns('a badger');

            const returned = loop.saveValues(req, res, callback);

            expect(returned).to.equal('a badger');
            callback.should.have.been.calledOnce;
            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'initial'
                },
                {
                  field1: 'something',
                  field2: 'somethingElse'
                },
                {
                  field1: 'badger2'
                }
              ]);
          });

          it('should remove any fields which are present and undefined from the specified item', () => {

            req.form.values = {
              field1: undefined,
              field2: null,
              field3: 'badger3'
            };
            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'initial'
              },
              {
                field1: 'badger',
                field2: 'aThing'
              },
              {
                field1: 'badger2'
              }
            ]);
            req.params.id = '1';
            callback.returns('a badger');

            const returned = loop.saveValues(req, res, callback);

            expect(returned).to.equal('a badger');
            callback.should.have.been.calledOnce;
            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'initial'
                },
                {
                  field3: 'badger3'
                },
                {
                  field1: 'badger2'
                }
              ]);
          });

          it('should not affect any fields which are not present in the request', () => {

            req.form.values = {
              field3: 'badger3'
            };
            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'initial'
              },
              {
                field1: 'badger',
                field2: 'aThing'
              },
              {
                field1: 'badger2'
              }
            ]);
            req.params.id = '1';
            callback.returns('a badger');

            const returned = loop.saveValues(req, res, callback);

            expect(returned).to.equal('a badger');
            callback.should.have.been.calledOnce;
            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'initial'
                },
                {
                  field1: 'badger',
                  field2: 'aThing',
                  field3: 'badger3'
                },
                {
                  field1: 'badger2'
                }
              ]);
          });
        });

        describe('when reaching the end of data entry for a new item', () => {
          it('should save the values into a new loop item', () => {

            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'initial'
              }
            ]);
            req.sessionModel.get.withArgs('field1').returns('something');
            req.sessionModel.get.withArgs('field2').returns('somethingElse');
            req.sessionModel.get.withArgs('field3').returns('something3');
            req.form.action = 'step2';
            req.form.options.next = 'add-another';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'initial'
                },
                {
                  field1: 'something',
                  field2: 'somethingElse',
                  field3: 'something3'
                }
              ]);
            req.sessionModel.unset.should.have.been.calledOnce
              .and.calledWithExactly(['field1', 'field2', 'field4', 'field3']);
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });

          it('should ignore fields with no value', () => {

            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'initial'
              }
            ]);
            req.sessionModel.get.withArgs('field1').returns('');
            req.sessionModel.get.withArgs('field2').returns('somethingElse');
            req.sessionModel.get.withArgs('field3').returns('');
            req.form.action = 'step2';
            req.form.options.next = 'add-another';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'initial'
                },
                {
                  field2: 'somethingElse',
                }
              ]);
            req.sessionModel.unset.should.have.been.calledOnce
              .and.calledWithExactly(['field1', 'field2', 'field4', 'field3']);
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });

          it('should create an array of items if none exists', () => {

            req.sessionModel.get.withArgs('items').returns(undefined);
            req.sessionModel.get.withArgs('field1').returns('something');
            req.sessionModel.get.withArgs('field2').returns('somethingElse');
            req.sessionModel.get.withArgs('field3').returns('something3');
            req.form.action = 'step2';
            req.form.options.next = 'add-another';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'something',
                  field2: 'somethingElse',
                  field3: 'something3'
                }
              ]);
            req.sessionModel.unset.should.have.been.calledOnce
              .and.calledWithExactly(['field1', 'field2', 'field4', 'field3']);
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });

          it('should handle errors in calling super.saveValues', () => {
            req.form.action = 'step2';
            req.form.options.next = 'add-another';

            const error = 'some error';
            superSaveValues.withArgs(req, res, sinon.match.func).callsArgWith(2, error);

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.not.have.been.called;
            req.sessionModel.unset.should.not.have.been.called;
            callback.should.have.been.calledOnce
              .and.calledWithExactly(error);
          });
        });

        describe('when reaching the end of data entry for a new item from a fork', () => {
          it('should save the values into a new loop item', () => {

            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'initial'
              }
            ]);
            req.sessionModel.get.withArgs('field1').returns('something');
            req.sessionModel.get.withArgs('field2').returns('somethingElse');
            req.sessionModel.get.withArgs('field3').returns('something3');
            req.sessionModel.get.withArgs('field4').returns('something4');
            req.form.action = 'forkedStep';
            req.form.options.next = 'add-another';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'initial'
                },
                {
                  field1: 'something',
                  field2: 'somethingElse',
                  field4: 'something4',
                  field3: 'something3'
                }
              ]);
            req.sessionModel.unset.should.have.been.calledOnce
              .and.calledWithExactly(['field1', 'field2', 'field4', 'field3']);
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });

          it('should ignore fields with no value', () => {

            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'initial'
              }
            ]);
            req.sessionModel.get.withArgs('field1').returns('');
            req.sessionModel.get.withArgs('field2').returns('somethingElse');
            req.sessionModel.get.withArgs('field4').returns(null);
            req.sessionModel.get.withArgs('field3').returns(undefined);
            req.form.action = 'step2';
            req.form.options.next = 'add-another';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'initial'
                },
                {
                  field2: 'somethingElse',
                }
              ]);
            req.sessionModel.unset.should.have.been.calledOnce
              .and.calledWithExactly(['field1', 'field2', 'field4', 'field3']);
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });

          it('should create an array of items if none exists', () => {

            req.sessionModel.get.withArgs('items').returns(undefined);
            req.sessionModel.get.withArgs('field1').returns('something');
            req.sessionModel.get.withArgs('field2').returns('somethingElse');
            req.sessionModel.get.withArgs('field3').returns('something3');
            req.form.action = 'step2';
            req.form.options.next = 'add-another';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'something',
                  field2: 'somethingElse',
                  field3: 'something3'
                }
              ]);
            req.sessionModel.unset.should.have.been.calledOnce
              .and.calledWithExactly(['field1', 'field2', 'field4', 'field3']);
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });

          it('should handle errors in calling super.saveValues', () => {
            req.form.action = 'step2';
            req.form.options.next = 'add-another';

            const error = 'some error';
            superSaveValues.withArgs(req, res, sinon.match.func).callsArgWith(2, error);

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.not.have.been.called;
            req.sessionModel.unset.should.not.have.been.called;
            callback.should.have.been.calledOnce
              .and.calledWithExactly(error);
          });
        });

        describe('when reaching the end of adding a new item in a single step loop', () => {
          beforeEach(()=> {
            options.subSteps = {
              something: {
                fields: ['field1', 'field2', 'field3']
              }
            };
            loop = new Loop(options);
          });
          it('should save the values into a new loop item', () => {

            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'initial'
              }
            ]);
            req.sessionModel.get.withArgs('field1').returns('something');
            req.sessionModel.get.withArgs('field2').returns('somethingElse');
            req.sessionModel.get.withArgs('field3').returns('something3');
            req.form.action = 'something';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'initial'
                },
                {
                  field1: 'something',
                  field2: 'somethingElse',
                  field3: 'something3'
                }
              ]);
            req.sessionModel.unset.should.have.been.calledOnce
              .and.calledWithExactly(['field1', 'field2', 'field4', 'field3']);
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });

          it('should create a new items array if none exists', () => {

            req.sessionModel.get.withArgs('items').returns(undefined);
            req.sessionModel.get.withArgs('field1').returns('something');
            req.sessionModel.get.withArgs('field2').returns('somethingElse');
            req.sessionModel.get.withArgs('field3').returns('something3');
            req.form.action = 'something';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('items', [
                {
                  field1: 'something',
                  field2: 'somethingElse',
                  field3: 'something3'
                }
              ]);
            req.sessionModel.unset.should.have.been.calledOnce
              .and.calledWithExactly(['field1', 'field2', 'field4', 'field3']);
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });

          it('should handle errors in calling super.saveValues', () => {
            req.form.action = 'something';

            const error = 'some error';
            superSaveValues.withArgs(req, res, sinon.match.func).callsArgWith(2, error);

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.not.have.been.called;
            req.sessionModel.unset.should.not.have.been.called;
            callback.should.have.been.calledOnce
              .and.calledWithExactly(error);
          });
        });

        describe('when submitting from the summary screen (last step of the loop)', () => {
          it('should do nothing', () => {

            req.params.action = 'add-another';

            loop.saveValues(req, res, callback);

            req.sessionModel.set.should.not.have.been.called;
            req.sessionModel.unset.should.not.have.been.called;
            callback.should.have.been.calledOnce
              .and.calledWithExactly();
          });
        });

        describe('when submitting from an intermediate data entry step', () => {
          it('should delegate to super.saveValues passing the original callback', () => {
            req.form.action = 'something';
            superSaveValues.withArgs(req, res, callback).returns('a badger');

            const returned = loop.saveValues(req, res, callback);

            req.sessionModel.set.should.not.have.been.called;
            req.sessionModel.unset.should.not.have.been.called;
            superSaveValues.should.have.been.calledOnce
              .and.calledWithExactly(req, res, callback);
            expect(returned).to.equal('a badger');
          });
        });
      });

      describe('locals', () => {
        const superLocals = sinon.stub(Controller.prototype, 'locals');

        beforeEach(()=> {
          superLocals.reset();
        });

        after(() => {
          superLocals.restore();
        });

        it('should expose appropriate locals for any page in the loop', () => {
          const existingLocals = {
            something: 'someValue',
            route: 'badgers'
          };
          options.loopData.sectionKey = 'my-section-key';

          superLocals.returns(existingLocals);

          const items = [{}];
          req.sessionModel.get.withArgs('items').returns(items);
          req.params.action = 'something';

          loop.loopPageSummary.summaryFor = sinon.stub();
          const loopSummary = {
            somethingElse: 'anotherValue'
          };
          loop.loopPageSummary.summaryFor.returns(loopSummary);

          const returned = loop.locals(req, res);

          superLocals.should.have.been.calledOnce
            .and.calledWithExactly(req, res);

          loop.loopPageSummary.summaryFor.should.have.been.calledOnce
            .and.calledWithExactly(req, 'badgers-something', items, options);

          expect(returned).to.deep.equal({
            something: 'someValue',
            route: 'badgers',
            somethingElse: 'anotherValue'
          });
        });
      });

      describe('successHandler', () => {
        const superSuccessHandler = sinon.stub(Controller.prototype, 'successHandler');

        beforeEach(() => {
          superSuccessHandler.reset();
        });

        after(() => {
          superSuccessHandler.restore();
        });

        describe('for the first visited page', () => {
          it('should store the completed step in the subSteps session model entry', () => {
            req.params.action = 'something';
            req.sessionModel.get.withArgs('subSteps').returns(undefined);
            superSuccessHandler.returns('super return value');

            const returned = loop.successHandler(req, res);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('subSteps', ['something']);
            expect(returned).to.equal('super return value');
          });
        });

        describe('for subsequent visited pages', () => {
          it('should store the completed step in the subSteps session model entry', () => {
            req.params.action = 'step2';
            req.sessionModel.get.withArgs('subSteps').returns(['something']);
            superSuccessHandler.returns('super return value');

            const returned = loop.successHandler(req, res);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('subSteps', ['something', 'step2']);
            expect(returned).to.equal('super return value');
          });

          it('should replace the completed step order if the page has already been visited previously', () => {
            req.params.action = 'step2';
            req.sessionModel.get.withArgs('subSteps').returns(['step2', 'add-another', 'something']);
            superSuccessHandler.returns('super return value');

            const returned = loop.successHandler(req, res);

            req.sessionModel.set.should.have.been.calledOnce
              .and.calledWithExactly('subSteps', ['add-another', 'something', 'step2']);
            expect(returned).to.equal('super return value');
          });
        });
      });

      describe('getValues', () => {
        const superGetValues = sinon.stub(Controller.prototype, 'getValues');

        beforeEach(()=> {
          superGetValues.reset();
        });

        after(()=> {
          superGetValues.restore();
        });

        describe('when editing an existing item', () => {
          it('should append the item with the specified id to the returned values before calling the callback', () => {
            req.params.action = 'step2';
            req.params.id = '1';
            const error = 'some error';
            const values = {
              key: 'value'
            };
            superGetValues.withArgs(req, res, sinon.match.func).callsArgWith(2, error, values);

            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'mongoose',
                field2: 'sheep',
                field3: 'deer'
              },
              {
                field1: 'badgers',
                field2: 'monkeys'
              },
              {
                field1: 'donkeys',
                field2: 'llamas',
                field3: 'giraffes'
              }
            ]);

            loop.getValues(req, res, callback);

            superGetValues.should.have.been.calledOnce
              .and.calledWithExactly(req, res, sinon.match.func);

            const expectedValues = {
              key: 'value',
              field1: 'badgers',
              field2: 'monkeys'
            };

            callback.should.have.been.calledOnce
              .and.calledWithExactly(error, expectedValues);
          });

          it('should continue without appending missing item', () => {
            req.params.action = 'step2';
            req.params.id = '1';
            const error = 'some error';
            const values = {
              key: 'value'
            };
            superGetValues.withArgs(req, res, sinon.match.func).callsArgWith(2, error, values);

            req.sessionModel.get.withArgs('items').returns([
              {
                field1: 'mongoose',
                field2: 'sheep',
                field3: 'deer'
              }
            ]);

            loop.getValues(req, res, callback);

            superGetValues.should.have.been.calledOnce
              .and.calledWithExactly(req, res, sinon.match.func);

            callback.should.have.been.calledOnce
              .and.calledWithExactly(error, values);
          });
        });

        describe('when adding a new item', () => {
          it('should return the results of passing error and values to the callback', () => {
            req.params.action = 'step2';
            const error = 'some error';
            const values = {
              key: 'value'
            };
            superGetValues.withArgs(req, res, sinon.match.func).callsArgWith(2, error, values);

            loop.getValues(req, res, callback);

            superGetValues.should.have.been.calledOnce
              .and.calledWithExactly(req, res, sinon.match.func);

            callback.should.have.been.calledOnce
              .and.calledWithExactly(error, values);
          });
        });
      });
  });
});
