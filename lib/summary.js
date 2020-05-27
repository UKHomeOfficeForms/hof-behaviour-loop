/* eslint-disable no-underscore-dangle */
'use strict';

const StandardSummaryBehaviour = require('hof-behaviour-summary-page');
const mix = require('mixwith').mix;

const _ = require('lodash');

const isDisplayedSection = (key, sections) =>
  _.find(sections, section => section.fields && section.fields.length > 0 && section.fields[0].step === key);

function ensureFieldsAreSet(options) {
  _.forEach(options.steps, step => {
    if (!step.fields || _.isEmpty(step.fields)) {
      if (step.loop && step.loop.subSteps) {
        step.fields = _.flatMap(step.loop.subSteps, subStep => subStep.fields);
      }
    }
  });
  return options;

}

module.exports = Base => class extends Base {
  constructor(options) {
    super(ensureFieldsAreSet(options));
    const Class = mix(Base).with(StandardSummaryBehaviour);
    this.standardSummaryBehaviour = new Class(options);
  }

  locals(req, res) {
    return Object.assign({}, super.locals(req, res), {
      rows: this.parseSections(req)
    });
  }

  parseSections(req) {
    const otherSections = this.standardSummaryBehaviour.parseSections(req);
    const splicedResult = this.addLoopSections(req, otherSections);
    return splicedResult;
  }

  addLoopSections(req, sections) {
    const addLoopSection = (loopStep, path) => {
      const sectionKey = path.replace(/\//g, '');
      const entities = req.sessionModel.get(loopStep.loop.storeKey || `${sectionKey}-items`);

      const includeField = (value, field) => {
        if (req.form.options.sections) {
          return (req.form.options.sections[sectionKey] || [])
            .map(f => (typeof f === 'object') ? f.field : f)
            .indexOf(field) > -1;
        }
        return !req.form.options.fieldsConfig[field].omitFromSummary;
      };

      const formatFromFieldConfig = (field, value) => {
        const anotherFieldConfig = req.form.options.fieldsConfig[field];
        return anotherFieldConfig && anotherFieldConfig.parse ? anotherFieldConfig.parse(value) : value;
      };

      const formatValue = (value, field) => {
        const settings = this.standardSummaryBehaviour.getSectionSettings(req.form.options);

        const fieldConfig = settings[path.replace(/^\//, '')].find(f =>
          f === field || f.field === field
        );
        if (typeof fieldConfig === 'string') {
          return formatFromFieldConfig(field, value);
        }
        return fieldConfig.parse ? fieldConfig.parse(value) : formatFromFieldConfig(field, value);
      };

      const getSubStep = (field, subSteps) =>
        _.findKey(subSteps, subStep => subStep.fields.indexOf(field) > -1);

      let _id;
      let spacer = {
          spacer: true
      };
      const summaryConfig = loopStep.loop.summary || {};
      let applySpacer = _.isNil(summaryConfig.applySpacer) ? true : summaryConfig.applySpacer;

      const fields = _.flatten(
        _.map(entities, (entity, id) =>
          _.flatMap(
            _.pickBy(entity, includeField), (value, field) => {
              let isFirstField = _id !== id;
              _id = id;
              let fieldEntry = {
                  field,
                  value: formatValue(value, field),
                  step: `${path}/${getSubStep(field, loopStep.loop.subSteps)}/${id}`,
                  label: req.translate([
                    `pages.confirm.fields.${field}.label`,
                    `fields.${field}.summary`,
                    `fields.${field}.label`,
                    `fields.${field}.legend`
                  ]),
                  changeLinkDescription: req.translate([
                    `pages.confirm.fields.${field}.changeLinkDescription`,
                    `fields.${field}.changeLinkDescription`,
                    `pages.confirm.fields.${field}.label`,
                    `fields.${field}.summary`,
                    `fields.${field}.label`,
                    `fields.${field}.legend`
                  ])
              };
              return id > 0 && isFirstField && applySpacer ? [spacer, fieldEntry] : [fieldEntry];
            })
        )
      );
      return {
        section: req.translate([
          `pages.confirm.sections.${sectionKey}.header`,
          `pages.${sectionKey}.header`
        ]),
        fields
      };
    };

    let foundSections = 0;
    Object.keys(req.form.options.steps).forEach((key) => {
      const step = req.form.options.steps[key];

      if (step.loop) {
          // this is a loop step
          const loopSection = addLoopSection(step, key);
          if (_.size(loopSection.fields) > 0) {
            // insert our loop section if it has any fields to show
            sections.splice(foundSections, 0, loopSection);
            foundSections++;
          }
      } else if (isDisplayedSection(key, sections)) {
          foundSections++;
      }
    });
    return sections;
  }
};
