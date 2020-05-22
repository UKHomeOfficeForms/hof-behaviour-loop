'use strict';

const _ = require('lodash');

function isValue(f, field) {
  return (typeof f === 'string') ? f === field : f.field === field;
}

function formatValue(value, field, sections) {
  if (value === '' || value === null || value === undefined) {
    return value;
  }
  const fieldConfig = _.find(sections, section =>
    _.find(section, f => isValue(f, field))
  ).find(f => isValue(f, field));
  if (typeof fieldConfig === 'object' && fieldConfig.parse) {
    return fieldConfig.parse(value);
  }
  return value;
}

module.exports = {
  conditionalTranslate: function conditionalTranslate(key, t) {
    if (_.isArray(key)) {
      return _.find(
        _.map(key, it => conditionalTranslate(it, t)),
        translated => translated
      );
    }
    const result = t(key);
    if (result !== key) {
      return result;
    }
    return undefined;
  },

  resolveTitle: function resolveTitle(req, firstItem, pagePath) {
    return firstItem ?
      this.conditionalTranslate([`pages.${pagePath}.first-item-header`, `pages.${pagePath}.header`], req.translate) :
      this.conditionalTranslate(`pages.${pagePath}.header`, req.translate);
  },

  toDisplayableSummary: function toDisplayableSummary(req, items, loopData) {
    const loopSections = req.form.options.steps[loopData.confirmStep].loopSections;

    const itemTitles = _.map(items, (item, id) => {
      if (loopData.headerField && item[loopData.headerField]) {
        return formatValue(item[loopData.headerField], loopData.headerField, loopSections);
      }
      const summaryTitle = req.translate(`pages.${loopData.sectionKey}.summary-item`);
      return items.length > 1 ? `${summaryTitle} ${Number(id) + 1}` : summaryTitle;
    });

    return _.map(items, (item, id) => {
      const itemFields = Object.keys(item).filter(field => !req.form.options.fields[field].omitFromSummary);

      let mappedFields = _.map(itemFields, field => ({
        field,
        header: req.translate([`fields.${field}.summary`, `fields.${field}.label`, `fields.${field}.legend`]),
        subroute: _.findKey(req.form.options.subSteps, subStep => subStep.fields.indexOf(field) > -1),
        value: formatValue(item[field], field, loopSections)
      }));

      if (loopData.headerField) {
         mappedFields = mappedFields.filter(it => it.field !== loopData.headerField);
      }

      const editFieldsIndividually = _.isNil(loopData.editFieldsIndividually) ? true : loopData.editFieldsIndividually;

      return {
        id,
        deleteRoute: this.firstStep(req),
        itemTitle: itemTitles[id],
        editFieldsIndividually: mappedFields.length === 0 ? false : editFieldsIndividually,
        changeRoute: _.findKey(req.form.options.subSteps, subStep => subStep.fields.indexOf(itemFields[0]) > -1),
        fields: mappedFields
      };
    });
  },

  firstStep(req) {
    return _.keys(req.form.options.subSteps)[0];
  }
};
