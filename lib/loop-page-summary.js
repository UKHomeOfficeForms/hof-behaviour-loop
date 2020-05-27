'use strict';


module.exports = {
    helpers: require('./helpers'),

    summaryFor: function summaryFor(req, pagePath, items, options) {
      const itemSummaries = this.helpers.toDisplayableSummary(req, items, options);

      const nextItemNumber = itemSummaries.length + 1;

      const title = this.helpers.conditionalTranslate([`pages.${pagePath}.item-${nextItemNumber}-header`,
                            `pages.${pagePath}.header`], req.translate);

      const intro = this.helpers.conditionalTranslate([`pages.${pagePath}.item-${nextItemNumber}-intro`,
        `pages.${pagePath}.intro`], req.translate);

      return {
        title,
        intro,
        items: itemSummaries,
        hasItems: items.length,
        deleteText: req.translate(`pages.${req.form.options.loop.sectionKey}.delete-text`)
      };

    }
};
