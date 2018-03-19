"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const restService = express();


var mysql = require('mysql');

//create connection Code doesn't works
var db_config = {
 host     : 'us-cdbr-iron-east-05.cleardb.net',
 user     : 'bc72622898452a',
 password : '3244bd28',
 database: 'heroku_8d64b4cb3978d80'
};

var connection;

//connect to db Code doesn't works
// db.connect((err) =>{
//   if(err){
//     throw err;
//   }
//   console.log('Mysql connected.....');
// }); 
function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(db_config); // Recreate the connection, since
													// the old one cannot be reused.

    connection.connect(function(err) {              	// The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 3000); // We introduce a delay before attempting to reconnect,
        }                                     	// to avoid a hot loop, and to allow our node script to
    });                                     	// process asynchronous requests in the meantime.
    											// If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 	// Connection to the MySQL server is usually
            handleDisconnect();                      	// lost due to either server restart, or a
        } else {                                      	// connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);
restService.use(bodyParser.json());


restService.get("/hello",function(req,res){
 
 connection.query('SELECT * from trainee', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        res.send(['Hello world', rows]);
    });
//	res.send('Hello world');
});

restService.post("/bot", function(req,res){
  var input = req.body.result.action;
  // var name = req.body.result.parameters.unit-informaiton; 
  // var surname = req.body.result.parameters.last-name; 
  // var course = req.body.result.parameters.Courses;
  var speech = " ";

  if(input =="scheduleResult"){
  	var input1 = req.body.result.parameters.dayOfWeek;
  	var sql = "SELECT course_name, time_start, time_finish FROM class INNER JOIN timetable ON class.course_id = timetable.course_id WHERE timetable.course_day = ? ORDER by time_start";
 	var speech1 = "Classes on "+input1+"is now processing ";
 	connection.query(sql,input1,function(err,rows,fields) {
 		 if (err) {
            console.log('error: ', err);
            throw err;
        }
        console.log(rows);
        speech2 = rows;
        speech1 = " Classes on "+input1+"is now processing";
    });
  	return res.json({
    	speech: speech1,
    	displayText: speech1,
    	source: "webhook-echo-sample"
  	});
  	// var input1 = req.body.result.action;
  }else if(input == "trainingprogress.trainingprogress-custom"){
  	var name = req.body.result.parameters.unit-informaiton; 
  	var surname = req.body.result.parameters.last-name; 
  	var course = req.body.result.parameters.Courses; 

  	speech = "Your name is "+name+" "+surname+". And your course is "+course;
  	var speech1  = "my training progress"; 
  	return res.json({
    	speech: speech1,
    	displayText: speech1,
    	source: "webhook-echo-sample"
  	});
  }else if(input == "TrainingTask.TrainingTask-custom"){
  	speech = "My task case";
  	return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});
  }
  input = " "; 
  
});

function ClassScheduleOnDay(){
	var dayOfWeek = req.body.result.parameters.dayOfWeek; 
  	speech = "Today is "+dayOfWeek; 
  	return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
 	});
}
restService.post("/echo", function(req, res) {
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



restService.listen(process.env.PORT || 3306, function() {
  console.log("Server up and listening");
});
