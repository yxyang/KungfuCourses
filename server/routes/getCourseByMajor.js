var fs = require("fs");
var path = require("path");

var findCourseByMajor = function(major, callback) {
	var courseMap = require('../data/map.json');
	var majorFolder = courseMap[major];
	var filePath = path.join(__dirname, '../data/' + majorFolder);

	fs.readdir(filePath, function(err, files) {
		if (err) {
			return callback({"courses": null, "prereqs": null})
		}
		if (files.indexOf('.DS_Store') >= 0) {
			files.splice(files.indexOf('.DS_Store'), 1);
		}
		var courses = [], edges = [], i = 0;

		for (var i in files) {
			var courseName = major + ' ' + files[i];
			courseName = courseName.replace('.json', '');

			courses.push(courseName);
			files[i] = '../data/' + majorFolder + '/' + files[i];

		}

		var map = {};


		var i = 0;
		while (i < files.length) {
			var preReqs = require(files[i]).prereq;
			for (var j in preReqs) {
				preReqs[j] = preReqs[j].replace('  ', ' ');
				var splitted = preReqs[j].split(' ');
				//console.log(splitted);
				var num = splitted[splitted.length - 1];
				splitted.splice(splitted.length - 1, 1);
				dept = splitted.join(' ');

				temp = '../data/' + courseMap[dept] + '/' + num + '.json';
				toPush = temp;

				try {
					var tt = require(temp);
				} catch (e) {
					toPush = null;
				}

				if (toPush != null) {
					edges.push([preReqs[j], courses[i]]);
					if (map[preReqs[j]] == null) {
						map[preReqs[j]] = 1;
					};
					if (map[courses[i]] == null) {
						map[courses[i]] = 1;
					}

					var found = 0;
					for (var k in courses) {
						if (courses[k] === preReqs[j]) {
							found = 1;
						}
					}
	
					if (found == 0) {
						files.push(temp);
						courses.push(preReqs[j]);
					}
				}
				
			}
			i++;
		}


		// Modify courses name and add course detail
		var ansCourses = [];
		var ansEdges = [];

		for (var i in courses) {
			if (map[courses[i]]) {
				courses[i] = courses[i].replace('  ', ' ');
				var currCourse = courses[i].split(' ');
				var courseNum = currCourse[currCourse.length - 1];
				currCourse.splice(currCourse.length - 1, 1);
				if (currCourse.length === 1) {
					var courseDept = currCourse.join(' ');
					courseDept = courseMap[courseDept].slice(0, 4)
				} else {
					currCourse = currCourse.map(function(str) {
						var new_str = str.slice(0,1);
						if (new_str === new_str.toLowerCase()) {
							return '';
						}
						return new_str;
					})
					var courseDept = currCourse.join('');
				}

				var courseDeptAbbr = courseMap[courses[i].match("[a-zA-Z]+(\\s*[a-zA-Z]+)*\\s")[0].trim()]
				ansCourses.push({
					'name': courseDept + ' ' + courseNum,
					'raw_name': courseDeptAbbr + ' ' + courseNum,
					'title': require(files[i]).name,
					'units': require(files[i]).units,
					'descrp': require(files[i]).descrp,
				});
			}

		}


		for (var i in edges) {
			edges[i][0] = edges[i][0].replace('  ', ' ');
			var currCourse = edges[i][0].split(' ');
			var courseNum1 = currCourse[currCourse.length - 1];
			currCourse.splice(currCourse.length - 1, 1);
			if (currCourse.length === 1) {
				var courseDept1 = currCourse.join(' ');
				courseDept1 = courseMap[courseDept1].slice(0, 4)
			} else {
				currCourse = currCourse.map(function(str) {
					var new_str = str.slice(0,1);
					if (new_str === new_str.toLowerCase()) {
						return '';
					}
					return new_str;
				})
				var courseDept1 = currCourse.join('');
			}

			edges[i][1] = edges[i][1].replace('  ', ' ');
			currCourse = edges[i][1].split(' ');
			var courseNum2 = currCourse[currCourse.length - 1];
			currCourse.splice(currCourse.length - 1, 1);
			if (currCourse.length === 1) {
				var courseDept2 = currCourse.join(' ');
				courseDept2 = courseMap[courseDept2].slice(0, 4)
			} else {
				currCourse = currCourse.map(function(str) {
					var new_str = str.slice(0,1);
					if (new_str === new_str.toLowerCase()) {
						return '';
					}
					return new_str;
				})
				var courseDept2 = currCourse.join('');
			}

			ansEdges.push([
				courseDept1 + ' ' + courseNum1,
				courseDept2 + ' ' + courseNum2
				]);
		}

		//console.log(ansCourses);
		//console.log(ansEdges);

		callback({
			"courses": ansCourses,
			"prereqs": ansEdges
		});
	})
}

module.exports = function(req, res, next) {
	//console.log(req.query);
    var majorName = req.query.name;
    findCourseByMajor(majorName, function(ans) {
    	res.jsonp(ans);
    	next();
    })

};