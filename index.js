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
  var speech = '';

  if(input =="scheduleResult"){
  	var input1 = req.body.result.parameters.dayOfWeek;
  // 	fetchClassSchedule(input1,function(rows){
  		
		// setTimeout(function(){
		// 	console.log("blablabla");
		// },5000);
  // 		speech = rows;
  // 		console.log("result" +speech);

  // 		//speech = "Hahaha"; 
  // 	})

  	var sql = "SELECT course_name, time_start, time_finish FROM class INNER JOIN timetable ON class.course_id = timetable.course_id WHERE timetable.course_day = ? ORDER by time_start";
 	connection.query(sql,input1,function(err,rows,fields) {
 		 if (err) {
            console.log('error: ', err);
            throw err;
        }for (var i in rows){
        	console.log(rows[i].course_name+" start from "+rows[i].time_start+" to "+rows[i].time_finish);
        }    	
        //speech2 = rows;
        speech = " Classes on "+input1+" is now processing";
    });

  	return res.json({
  		speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});

  	// var input1 = req.body.result.action;
  }else if(input == "trainingprogress.trainingprogress-custom"){
  	var name = req.body.result.parameters.Firstname; 
  	var surname = req.body.result.parameters.Lastname; 
  	var course = req.body.result.parameters.Courses;
  	var progressInput =  req.body.result.parameters.ProgressInput;
    var sql = "SELECT `trainee`.`Firstname`,`trainee`.`Lastname` ,`class`.`course_name`, `testresult`.`score`,`testresult`.`result`,`testresult`.`date`,`testresult`.`comment` FROM (`trainee` INNER JOIN `testresult` ON `trainee`.`studentID` = `testresult`.`studentID`) INNER JOIN `class` ON `testresult`.`course_id` = `class`.`course_id` WHERE `trainee`.`Firstname` = ? AND `trainee`.`Lastname`= ? AND `class`.`course_name`=  ? ";
  	if(progressInput != null ){
  		fetchProgress([name,surname,course],function(result){
  			speech = result; 
  		})
  //     connection.query(sql,[name,surname,course], function (err,rows,fields){
  //     	if (err) {
  //     		console.log('error: ', err);
  //       	throw err;
  //     	}
  //     	for (var i in rows) {
  //     		var speech1 = rows[i].Firstname+" "+rows[i].Lastname+" "+rows[i].result+" "+rows[i].course_name+" with score of "+rows[i].score+" out of 100 (pass score is 85). Test on "+rows[i].date; 
  //       	console.log(speech1);
  //       	speech = speech1; 
  //     	}
		// });
		// connection.end();
  		//speech = "Your name is "+name+" "+surname+". And your course is "+course;
  		//var speech1  = "my training progress"; 
  	}else{
  		speech = "Type again with this format: Progress, Myname, MyLastname, Basic combat pistol.";
  	}
  	return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});
  }else if(input == "TrainingTask.TrainingTask-custom"){
  	var name = req.body.result.parameters.Firstname; 
  	var surname = req.body.result.parameters.Lastname; 
  	var course = req.body.result.parameters.Courses;
  	fetchTask([name,surname,course],function(result){
  		speech = result;
  	})
    // var sql1 = "SELECT `trainee`.`studentID`,`enroll`.`P_id`,`enroll`.`Day_no`,`course_name`,`t_description` FROM ((`enroll` INNER JOIN `trainee` ON `enroll`.`studentID`= `trainee`.`StudentID` ) INNER JOIN `class` ON `enroll`.`course_id` = `class`.`course_id`) INNER JOIN (`tasktoday` INNER JOIN `curriculum` ON `tasktoday`.`t_id`=`curriculum`.`t_id`) ON `enroll`.`P_id` = `tasktoday`.`P_id` AND `enroll`.`Day_no`= `tasktoday`.`Day_no` AND `class`.`Level`= `tasktoday`.`Level`WHERE `trainee`.`FirstName`=? AND `trainee`.`LastName`=? AND `class`.`course_name`=?";
    // connection.query(sql1,[name,surname,course],function(err,rows,fields) {
    //  if (err) {
    //         console.log('error: ', err);
    //         throw err;
    //     }
    //     speech = "Your tasks on Day "+rows[0].Day_no+" are: "; 
    //     console.log("Your tasks on Day "+rows[0].Day_no+" are: ");
    //     for (var i in rows){
    //     	console.log(rows[i].t_description);
    //     }
        
    // });
    // connection.end();
  	speech = "My task case for "+name+" "+surname+" on course: "+course;
  	return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});
  }else if(input == "Packageoptions.Packageoptions-custom.Packageoptions-private-price"){
  	var numTraining = req.body.result.parameters.number;
  	var courseType  = req.body.result.parameters.Courses;
  	var totalPrice; 
  	if(courseType == "lived fire"){
  		if(numTraining < 3){
  			totalPrice = numTraining;
  		}else{
  			totalPrice = numTraining* 2000 - ((numTraining/2)-1)*500;
  		}
  		speech = "You wanna train "+numTraining+" private classes for lived fire, so the price is at "+totalPrice+" Baht.";
  	}else if (courseType == "simulated training"){
  		if(numTraining < 3){
  			totalPrice = numTraining;
  		}else{
  			totalPrice = numTraining* 1000 - ((numTraining/2)-1)*500;
  		}
  		speech = "You wanna train "+numTraining+" private classes for simulated training, so the price is at "+totalPrice+" Baht.";
  	}
  	//speech = "Private price process";

  	return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});
  }else if(input == "simmulatecourseschedule.simmulatecourseschedule-custom"){
  	var courseInput = req.body.result.parameters.Courses; 
  	fetchSpecifyTimetable(courseInput,function(result){
  			speech = result; 
  	})
  	speech = "Schedule of "+courseInput; 

  	return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});

  }
  input = " "; 
  
});

function fetchTask([name,surname,course],callback){
	var speech1 = " ";
	var sql1 = "SELECT `trainee`.`studentID`,`enroll`.`P_id`,`enroll`.`Day_no`,`course_name`,`t_description` FROM ((`enroll` INNER JOIN `trainee` ON `enroll`.`studentID`= `trainee`.`StudentID` ) INNER JOIN `class` ON `enroll`.`course_id` = `class`.`course_id`) INNER JOIN (`tasktoday` INNER JOIN `curriculum` ON `tasktoday`.`t_id`=`curriculum`.`t_id`) ON `enroll`.`P_id` = `tasktoday`.`P_id` AND `enroll`.`Day_no`= `tasktoday`.`Day_no` AND `class`.`Level`= `tasktoday`.`Level`WHERE `trainee`.`FirstName`=? AND `trainee`.`LastName`=? AND `class`.`course_name`=?";
    connection.query(sql1,[name,surname,course],function(err,rows,fields) {
     if (err) {
            console.log('error: ', err);
            throw err;
        }
        //speech = "Your tasks on Day "+rows[0].Day_no+" are: "; 
        console.log("Your tasks on Day "+rows[0].Day_no+" are: ");
        for (var i in rows){
        	speech1 = speech1+"\n"+rows[i].t_description;	
        }
        console.log(speech1);
    });
    return callback(speech1);
    connection.end();
}

function fetchProgress([name,surname,course],callback){
	var speech1 = " ";
	var sql = "SELECT `trainee`.`Firstname`,`trainee`.`Lastname` ,`class`.`course_name`, `testresult`.`score`,`testresult`.`result`,`testresult`.`date`,`testresult`.`comment` FROM (`trainee` INNER JOIN `testresult` ON `trainee`.`studentID` = `testresult`.`studentID`) INNER JOIN `class` ON `testresult`.`course_id` = `class`.`course_id` WHERE `trainee`.`Firstname` = ? AND `trainee`.`Lastname`= ? AND `class`.`course_name`=  ? ";
  	connection.query(sql,[name,surname,course], function (err,rows,fields){
      	if (err) {
      		console.log('error: ', err);
        	throw err;
      	}
      	for (var i in rows) {
      		var speech1 = rows[i].Firstname+" "+rows[i].Lastname+" "+rows[i].result+" "+rows[i].course_name+" with score of "+rows[i].score+" out of 100 (pass score is 85). Test on "+rows[i].date+"\n"+"Comment: "+rows[i].comment; 
        	
        	return callback(speech1); 
      	}
      	console.log(speech1);
		});
  	return callback(speech1); 
  	connection.end();
}

function fetchClassSchedule(input1,callback){
	var speech1 = " "; 
	var sql = "SELECT course_name, time_start, time_finish FROM class INNER JOIN timetable ON class.course_id = timetable.course_id WHERE timetable.course_day = ? ORDER by time_start";
 	connection.query(sql,input1,function(err,rows,fields) {
 		 if (err) {
            console.log('error: ', err);
            throw err;
        }for (var i in rows){
        	speech1 = speech1 +"\n" +rows[i].course_name+" start from "+rows[i].time_start+" to "+rows[i].time_finish;
        	speech1 = "wow";
        	//return callback(speech1);
        }
        console.log(speech1);

    });
    return callback(speech1);
    connection.end();

} 

function fetchSpecifyTimetable(courseInput,callback){
	var speech1 = " "; 
	var sql =  "SELECT timetable.`course_day` ,course_name, time_start, time_finish FROM class INNER JOIN timetable ON class.course_id = timetable.course_id WHERE class.`course_name` = ? ORDER by  timetable.`course_day_num`";
	connection.query(sql,courseInput,function(err,rows,fields){
		if (err) {
            console.log('error: ', err);
            throw err;
        }for (var i in rows){
        	speech1 = speech1 +"\n" +rows[i].course_day+" "+rows[i].course_name+" start from "+rows[i].time_start+" to "+rows[i].time_finish;
        	//speech1 = "wow";
        }
        console.log(speech1);
    });
    return callback(speech1);
    connection.end();
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
