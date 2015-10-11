var findCourseDetail = function(name) {
	return {
		name: "cs61a",
		instructor: "John Denero",
		description: "dummy description"
	}
}

module.exports = function(req, res, next) {
	var courseName = req.courseName;
	res.jsonp(findCourseDetail(courseName));
}