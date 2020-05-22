'use strict';

module.exports = res => {
  res.redirect = res.redirect || sinon.spy();
  return require('reqres').res(res);
};
