var log = require('../log');
var env = (process.env.NODE_ENV || "development").toLowerCase();


exports.index = function(req, res){
  log.debug('Rendering home.');
  res.render('home',
    {
      env : process.env.NODE_ENV,
      production : env=="production"
    });
  log.debug('Done rendering home.');
};

exports.card = require("./beatmachine.js");
