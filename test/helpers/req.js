'use strict';

module.exports = req => {
  req.form = req.form || {};
  req.form.values = req.form.values || {};
  req.form.options = req.form.options || {};
  req.form.options.route = req.form.options.route || '/something';
  req.params = req.params || {};
  req.sessionModel = req.sessionModel || {
    set: sinon.stub(),
    get: sinon.stub(),
    unset: sinon.stub()
  };
  req.translate = req.translate || sinon.stub();
  req.baseUrl = req.baseUrl || '/app';
  return require('reqres').req(req);
};
