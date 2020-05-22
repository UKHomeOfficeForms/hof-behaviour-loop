'use strict';

const path = require('path');

module.exports.Loop = require('./lib/loop');
module.exports.SummaryWithLoopItems = require('./lib/summary.js');
module.exports.views = path.resolve(__dirname, './views');
