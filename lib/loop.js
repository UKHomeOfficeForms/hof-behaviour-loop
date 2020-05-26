/* eslint-disable no-underscore-dangle */

'use strict';

const _ = require('lodash');
const path = require('path');

function ensureFieldsAreSet(options) {
  if (!options.fields || _.isEmpty(options.fields)) {
    if (options.subSteps) {
      options.fields = _.mapValues(
      _.keyBy(
          _.map(
            _.flatMap(options.subSteps, step => step.fields),
            field => {
              return {name: field, config: options.fieldsConfig[field]};
            }
          ),
          'name'),
          'config'
      );
    }
  }
  return options;
}

module.exports = superclass => class extends superclass {

  constructor(options) {
    super(ensureFieldsAreSet(options));
    this.options.loopData.storeKey = this.options.loopData.storeKey || 'items';
    this.options.loopData.sectionKey = (this.options.route || '').replace(/^\//, '');
    this.confirmStep = this.options.loopData.confirmStep;
    this.loopPageSummary = require('./loop-page-summary.js');
  }

  configure(req, res, callback) {
    const step = this.findSubStep(req);
    Object.assign(req.form.options, step, {
      fields: _.pick(req.form.options.fields, step.fields)
    });
    callback();
  }

  get(req, res, callback) {
    if (!req.params.action ||
      !this.findSubStep(req) ||
      (!this.prereqsSatisfied(req) && !this.editing(req))
    ) {
      const step = this.hasItems(req) ?
        this.finalStep() :
        _.keys(this.options.subSteps)[0];
      return this.redirectTo(step, req, res);
    }
    if (req.params.edit === 'delete' && req.params.id) {
      return this.removeItem(req, res);
    }
    return super.get(req, res, callback);
  }

  getBackLink(req, res) {
    const subSteps = _.intersection(
      Object.keys(this.options.subSteps),
      [
       ...(req.sessionModel.get('subSteps') || []),
        req.params.action
      ]
    );
    const finalStep = this.finalStep();
    if (subSteps.length === 1 || req.params.action === finalStep) {
      return super.getBackLink(req, res);
    }
    const index = subSteps.indexOf(req.params.action);
    const relativeRoute = this.options.route.startsWith('/') ? this.options.route.substring(1) : this.options.route;
    return `${relativeRoute}/${(subSteps[index - 1] || finalStep)}`;
  }

  getNextStep(req, res) {
    if (req.params.edit === 'edit') {
      return path.join(req.baseUrl, this.confirmStep);
    }

    const last = _.findKey(req.form.options.subSteps, step => !step.next);
    if (req.params.edit === 'change') {
      const re = new RegExp(`(${req.form.options.route}/)${req.params.action}.*`);
      return path.join(req.baseUrl, req.url.replace(re, `$1${last}`));
    }

    const stepName = req.params.action;
    const loopCondition = req.form.options.loopCondition;
    if (stepName !== last) {
      const re = new RegExp(`${stepName}$`);
      const next = this.getNext(req, res);
      return path.join(req.baseUrl, req.url.replace(re, next));
    } else if (loopCondition && req.form.values[loopCondition.field] === loopCondition.value) {
      return path.join(req.baseUrl, req.url.replace(stepName, this.firstStep()).replace(req.params.id, ''));
    }
    return super.getNextStep(req, res);
  }

  saveValues(req, res, callback) {
    const steps = Object.keys(this.options.subSteps);
    if (req.params.id) {
      const items = this.getItems(req);
      const item = items[Number(req.params.id)];
      Object.keys(req.form.values).forEach(field => {
        if (req.form.values[field]) {
          item[field] = req.form.values[field];
        } else {
          delete item[field];
        }
      });
      req.sessionModel.set(this.options.loopData.storeKey, items);
      return callback();
    }
    if (this.getNext(req, res) === this.finalStep() || steps.length === 1) {
      return super.saveValues(req, res, (err) => {
        if (err) {
          return callback(err);
        }
        const items = this.getItems(req);
        items.push(Object.keys(this.options.fields)
          .reduce((obj, field) => {
            const value = req.sessionModel.get(field);
            if (value && value !== '') {
              return Object.assign(obj, {
                [field]: value
              });
            }
          return obj;
          }, {}));
        req.sessionModel.set(this.options.loopData.storeKey, items);
        req.sessionModel.unset(Object.keys(this.options.fields));
        return callback();
      });
    }
    if (steps.indexOf(req.params.action) === steps.length - 1) {
      return callback();
    }
    return super.saveValues(req, res, callback);
  }

  locals(req, res) {
    const locals = super.locals(req, res);
    const pagePath = `${locals.route}-${req.params.action}`;

    let items = this.getItems(req);

    return Object.assign({}, locals, this.loopPageSummary.summaryFor(req, pagePath, items, this.options));
  }

  successHandler(req, res) {
    const subSteps = _.without((req.sessionModel.get('subSteps') || []), req.params.action);
    subSteps.push(req.params.action);
    req.sessionModel.set('subSteps', subSteps);
    return super.successHandler(req, res);
  }

  getValues(req, res, callback) {
    super.getValues(req, res, (err, values) => {
      if (req.params.id !== undefined) {
        const items = this.getItems(req);
        values = Object.assign({}, values, items[Number(req.params.id)] || {});
      }
      return callback(err, values);
    });
  }

  getNext(req, res) {
    if (req.form.options.forks) {
      return super.getForkTarget(req, res);
    }
    return req.form.options.next;
  }

  prereqsSatisfied(req) {
    const step = this.findSubStep(req);
    let prereqs = step.prereqs;
    if (!step.prereqs) {
      return true;
    }
    prereqs = _.castArray(prereqs);
    return prereqs.every(prereq => req.sessionModel.get(prereq) !== undefined);
  }

  findSubStep(req) {
    return this.options.subSteps[req.params.action];
  }

  redirectTo(step, req, res) {
    return res.redirect(`${req.baseUrl.replace(/\/$/, '')}${this.options.route.replace(/\/$/, '')}/${step}`);
  }

  finalStep() {
    return _.findKey(this.options.subSteps, s => !s.next);
  }

  firstStep() {
    return _.keys(this.options.subSteps)[0];
  }

  editing(req) {
    return req.params.edit === 'edit' || req.params.edit === 'change';
  }

  hasItems(req) {
    return _.size(req.sessionModel.get(this.options.loopData.storeKey));
  }

  removeItem(req, res) {
    const items = req.sessionModel.get(this.options.loopData.storeKey);
    items.splice(Number(req.params.id), 1);
    req.sessionModel.set(this.options.loopData.storeKey, items);
    const step = _.size(items) > 0 ? this.finalStep() : this.firstStep();
    return this.redirectTo(step, req, res);
  }

  getItems(req) {
    return req.sessionModel.get(req.form.options.loopData.storeKey) || [];
  }
};
