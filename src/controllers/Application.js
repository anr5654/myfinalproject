var _ = require('underscore');
var models = require('../models');
var Account = models.Account;

var myApplication = function(req, res) {
    res.render('application');
};

var logout = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};

module.exports.App = myApplication;
