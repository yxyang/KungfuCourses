var fs = require("fs");
var path = require("path");

var findCourseDetail = function(courseName) {
	console.log(courseName);
	var courseMap = require('../data/map.json');
	var currCourse = courseName.split(' ');
	var courseNum = currCourse[currCourse.length - 1];
	var courseDept = currCourse.splice(0, currCourse.length-1).join(" ");
	var grade = require('../data/' + courseDept + '/' + courseNum + '_grade.json');
	return grade;
}

module.exports = function(req, res, next) {
	var courseName = req.query.name;
	res.jsonp(findCourseDetail(courseName));
	next();
}