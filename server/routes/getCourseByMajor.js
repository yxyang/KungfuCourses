var findCourseByMajor = function(name) {
	return {
		courses: ["cs61a", "cs61b", "cs61c", "cs70", "cs170"],
		prereqs: [
			["cs61a", "cs61b"],
			["cs61a", "cs61c"],
			["cs61a", "cs70"],
			["cs61b", "cs170"],
			["cs70", "cs170"]
		]
	}
}



module.exports = function(req, res, next) {
    var majorName = req.majorName;
    res.json(findCourseByMajor(majorName));
    next();
};