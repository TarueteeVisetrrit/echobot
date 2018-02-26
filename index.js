"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');
//create connection 
const db = mysql.createConnection({
 host     : 'localhost',
 user     : 'root',
 password : 'root',
 databse  : 'CTS'
});
//connect to db
db.connect((err) =>{
  if(err){
    throw err;
  }
  console.log('Mysql connected.....');
}); 
const restService = express();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());

restService.listen('3306',() =>{
  console.log('Server started on port 3306');
});

restService.post("/echo", function(req, res) {
  var day = req.body.result.parameters.date;
  var sql = 'SELECT course_name, time_start, time_finish FROM Class INNER JOIN Timetable WHERE Class.course_id = Timetable.course_id AND Timetable.course_day = ? ORDER by time_start;'
  var speech = ' ';
  con.query(sql, [day], function (err, result) {
  if (err) throw err;
  speech = console.log(result);
});
  var speech =
    req.body.result &&
    req.body.result.parameters &&
    req.body.result.parameters.echoText
      ? req.body.result.parameters.echoText
      : "Seems like some problem. Speak again.";
  return res.json({
    speech: speech,
    displayText: speech,
    source: "webhook-echo-sample"
  });
});




