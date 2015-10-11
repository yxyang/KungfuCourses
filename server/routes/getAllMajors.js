var fs = require("fs");
var path = require("path");

module.exports = function(req, res, next) {
	var map = require('../data/map.json');
	res.jsonp(Object.keys(map));
	next();
}