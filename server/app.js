var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    routes = require('./routes/index');

app.use(bodyParser.json({"limit": "20mb"}));

app.get('/major', routes.getCourseByMajor);

app.get('/allMajors', routes.getAllMajors);

app.get('/course', routes.getCourseDetail);

app.listen(3015);

console.log("kungfu-server is listening to port 3015");
