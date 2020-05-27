'use strict';


module.exports = {
    helpers: require('./helpers'),

    summaryFor: function summaryFor(req, pagePath, items, options) {
      const itemSummaries = this.helpers.toDisplayableSummary(req, items, options);

      const title = this.helpers.resolveTitle(req, itemSummaries.length === 0, pagePath);

      const intro = this.helpers.conditionalTranslate(`pages.${pagePath}.intro`, req.translate);

      return {
        title,
        intro,
        items: itemSummaries,
        summaryTitle: req.translate(`pages.${req.form.options.loop.sectionKey}.header`),
        hasItems: items.length,
        deleteText: req.translate(`pages.${req.form.options.loop.sectionKey}.delete-text`)
      };

    }
};
