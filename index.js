"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const restService = express();


var mysql = require('mysql');

//create connection 
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
  	var speechOutput = " ";  
  	var input1 = req.body.result.parameters.dayOfWeek;
    fetchClassSchedule(input1,function(rows){
  		
			// setTimeout(function(){
				console.log("blablabla");
				speech = rows;
	  			console.log("result: " +speech);
	  			return res.json({
	  				speech: speech,
    				displayText: speech,
    				source: "webhook-echo-sample"
  				})
	  			// console.log(res)
	  			// return res
			// },10000);
  		// speech = rows;
  		// console.log("result" +speech);

  		//speech = "Hahaha"; 
  		})

  // 	var sql = "SELECT course_name, time_start, time_finish FROM class INNER JOIN timetable ON class.course_id = timetable.course_id WHERE timetable.course_day = ? ORDER by time_start";
 	// connection.query(sql,input1,function(err,rows,fields) {
 	// 	 if (err) {
  //           console.log('error: ', err);
  //           throw err;
  //       }for (var i in rows){
  //       	speechOutput = speechOutput+"\n"+rows[i].course_name+" start from "+rows[i].time_start+" to "+rows[i].time_finish; 
        	
  //       }  
  //       console.log(speechOutput);  	
 
  //       setTimeout(function(){
  //       	console.log("Fetching");
  //       	speech = speechOutput;
  //       	console.log("Result: "+speech);
  //       	console.log("Done");
  //       },10000);
  //   });


  	

  	// var input1 = req.body.result.action;
  }else if(input == "trainingprogress.trainingprogress-custom"){
  	var name = req.body.result.parameters.Firstname; 
  	var surname = req.body.result.parameters.Lastname; 
  	var course = req.body.result.parameters.Courses;
  	var progressInput =  req.body.result.parameters.ProgressInput;
    var sql = "SELECT `trainee`.`Firstname`,`trainee`.`Lastname` ,`class`.`course_name`, `testresult`.`score`,`testresult`.`result`,`testresult`.`date`,`testresult`.`comment` FROM (`trainee` INNER JOIN `testresult` ON `trainee`.`studentID` = `testresult`.`studentID`) INNER JOIN `class` ON `testresult`.`course_id` = `class`.`course_id` WHERE `trainee`.`Firstname` = ? AND `trainee`.`Lastname`= ? AND `class`.`course_name`=  ? ";
  	if(progressInput != null ){
  		fetchProgress([name,surname,course],function(rows){
  			console.log("blablabla");
				speech = rows;
	  			console.log("result: " +speech);
	  			return res.json({
	  				speech: speech,
    				displayText: speech,
    				source: "webhook-echo-sample"
  				}) 
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
  		return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});
  	}
  	
  }else if(input == "TrainingTask.TrainingTask-custom"){
  	var name = req.body.result.parameters.Firstname; 
  	var surname = req.body.result.parameters.Lastname; 
  	var course = req.body.result.parameters.Courses;
  	fetchTask([name,surname,course],function(result){
  		speech = result;
  		return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});

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
  	// speech = "My task case for "+name+" "+surname+" on course: "+course;
  	// return res.json({
   //  	speech: speech,
   //  	displayText: speech,
   //  	source: "webhook-echo-sample"
  	// });
  }else if(input == "Packageoptions.Packageoptions-custom.Packageoptions-private-price"){
  	var numTraining = req.body.result.parameters.number;
  	var courseType  = req.body.result.parameters.Courses;
  	var totalPrice;
  	// var totalPrice1;
  	// var totalPrice2; 
  	if(courseType == "lived fire"){
  		if(numTraining < 3){
  			totalPrice = numTraining;
  			// totalPrice1 = totalPrice*0.8; 
  			// totalPrice2 = totalPrice*0.6;
  		}else{
  			totalPrice = numTraining* 2000 - ((numTraining/2)-1)*500;
  			// totalPrice1 = totalPrice*0.8; 
  			// totalPrice2 = totalPrice*0.6;
  		}
  		speech = " "+numTraining+" private classes for lived fire, so the price is at "+totalPrice+" Baht.";
  	}else if (courseType == "simulated training"){
  		if(numTraining < 3){
  			totalPrice = numTraining;
  			// totalPrice1 = totalPrice*0.8; 
  			// totalPrice2 = totalPrice*0.6;
  		}else{
  			totalPrice = numTraining* 1000 - ((numTraining/2)-1)*500;
  			// totalPrice1 = totalPrice*0.8; 
  			// totalPrice2 = totalPrice*0.6;
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
  			return res.json({
		    	speech: speech,
		    	displayText: speech,
		    	source: "webhook-echo-sample"
		  	});
  	})
  	// speech = "Schedule of "+courseInput; 

  	// return res.json({
   //  	speech: speech,
   //  	displayText: speech,
   //  	source: "webhook-echo-sample"
  	// });

  }else if(input == "Check-in.Check-in-custom"){
  	var name = req.body.result.parameters.Firstname; 
  	var surname = req.body.result.parameters.Lastname; 
  	var course = req.body.result.parameters.Courses; 
  	var day;

  	var sql1 = "SELECT trainee.`FirstName`, trainee.`LastName`,class.`course_name`, enroll.`Day_no` FROM (enroll INNER JOIN class ON enroll.`course_id` = class.`course_id`) INNER JOIN trainee ON enroll.`studentID` = trainee.`StudentID` WHERE trainee.`FirstName` = ? AND trainee.`LastName`= ? AND class.`course_name`= ?";
  	connection.query(sql1,[name,surname,course],function(err,rows,fields){
  		if (err) {
            console.log('error: ', err);
            throw err;
        }
        var speech1 = " ";
        for(var i in rows){
        	speech1 = "Old: "+rows[i].FirstName+" "+rows[i].LastName+". Day no: "+rows[i].Day_no;
        	day = rows[i].Day_no + 1;
        }
        console.log(speech1);
        console.log("New day no.: "+day);
  	});

  	setTimeout(function(){
  		console.log("blablabla");
  		var sql2 = "UPDATE enroll INNER JOIN trainee ON enroll.`studentID` = trainee.`StudentID` INNER JOIN class ON enroll.`course_id`= class.`course_id` SET enroll.`Day_no` = ?  WHERE trainee.`FirstName` = ? AND trainee.`LastName`= ? AND class.`course_name`= ?";
  		connection.query(sql2,[day,name,surname,course],function(err,rows,fields){
  			if (err) {
            	console.log('error: ', err);
           		throw err;
        	}
        console.log("Updated");
  	});
  	},10000);

  	speech = "Welcome "+name+" "+surname+" to "+course;

  	return res.json({
    	speech: speech,
    	displayText: speech,
    	source: "webhook-echo-sample"
  	});
  }else if(input == "Accuracyanalysis.Accuracyanalysis-custom"){
  	var position = req.body.result.parameters.number; 
  	if(position >=1 && position < 2){
  		speech = "You are anticipating the recoil."; 
  	}else if(position >=2 && position < 3){
  		speech = "Your thumb are squeezed too much or put too deep trigger finger."; 
  	}else if(position >=3 && position < 4){
  		speech = "Your grip is tighten when pulling the trigger."; 
  	}else if(position >=5 && position < 7){
  		speech = "Your wrist is broke down, pushing your gun foward, or droping the head when pulling the trigger.";
  	}else if(position >=7 && position < 8){
  		speech = "Your finger is tighten when pulling the trigger, or you are jerking/ slapping the trigger.";
  	}else if(position >=8 && position < 10){
  		speech = "Your trigger finger is not deep enough.";
  	}else if(position >=10 && position < 11){
  		speech = "You pushed to anticipating the recoil, not follow through.";
  	}else if(position >=11 && position < 12){
  		speech = "Your wrist is broke up.";
  	}else{
  		speech = "Your number must be integer from 1 to 12";
  	}

  	//speech = "num is "+position;

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
	var speech2 = " ";
	var speech3 = " ";
	var sql1 = "SELECT `trainee`.`studentID`,`enroll`.`P_id`,`enroll`.`Day_no`,`course_name`,`t_description` FROM ((`enroll` INNER JOIN `trainee` ON `enroll`.`studentID`= `trainee`.`StudentID` ) INNER JOIN `class` ON `enroll`.`course_id` = `class`.`course_id`) INNER JOIN (`tasktoday` INNER JOIN `curriculum` ON `tasktoday`.`t_id`=`curriculum`.`t_id`) ON `enroll`.`P_id` = `tasktoday`.`P_id` AND `enroll`.`Day_no`= `tasktoday`.`Day_no` AND `class`.`Level`= `tasktoday`.`Level`WHERE `trainee`.`FirstName`=? AND `trainee`.`LastName`=? AND `class`.`course_name`=?";
    connection.query(sql1,[name,surname,course],function(err,rows,fields) {
     if (err) {
            console.log('error: ', err);
            throw err;
        }
        speech2 = "Your tasks on Day "+rows[0].Day_no+" are: "; 
        console.log(speech2);
        for (var i in rows){
        	speech1 = speech1+"\n"+rows[i].t_description;	
        }
        speech3 = speech2+"\n"+speech1;
        console.log(speech1);
        console.log(speech3);
        callback(speech3);
        return;
    });
    connection.end();
}

function fetchProgress([name,surname,course],callback){
	var speech1 = " ";
	var sql = "SELECT `trainee`.`Firstname`,`trainee`.`Lastname` ,`class`.`course_name`, `testresult`.`score`,`testresult`.`result`,`testresult`.`date`,`testresult`.`comment`,`testresult`.`Recommended_course` FROM (`trainee` INNER JOIN `testresult` ON `trainee`.`studentID` = `testresult`.`studentID`) INNER JOIN `class` ON `testresult`.`course_id` = `class`.`course_id` WHERE `trainee`.`Firstname` = ? AND `trainee`.`Lastname`= ? AND `class`.`course_name`=  ? ";
  	connection.query(sql,[name,surname,course], function (err,rows,fields){
      	if (err) {
      		console.log('error: ', err);
        	throw err;
      	}
      	for (var i in rows) {
      		speech1 = rows[i].Firstname+" "+rows[i].Lastname+" "+rows[i].result+" "+rows[i].course_name+" with score of "+rows[i].score+" out of 100 (pass score is 85). Test on "+rows[i].date+"\n"+"Comment: "+rows[i].comment+"\n"+"Course that you may interest: "+rows[i].Recommended_course; 	 
      	}
      	console.log(speech1);
      	console.log(speech1);
        callback(speech1);
        return;
	});
  	
  	connection.end();
}

function fetchClassSchedule(input1,callback){
	var speech1 = " "; 
	var sql = "SELECT course_name, time_start, time_finish FROM class INNER JOIN timetable ON class.course_id = timetable.course_id WHERE timetable.course_day = ? ORDER by time_start";
 	// setTimeout(function(){
 		console.log("Fetching");
 		connection.query(sql,input1,function(err,rows,fields) {
 		 if (err) {
            console.log('error: ', err);
            throw err;
        }for (var i in rows){
        	speech1 = speech1 +"\n" +rows[i].course_name+" start from "+rows[i].time_start+" to "+rows[i].time_finish;
        	//speech1 = "wow";
        	
        }
        console.log(speech1);
        callback(speech1);
        return;
    });
 		connection.end();

 	// },5000);

 	// connection.query(sql,input1,function(err,rows,fields) {
 	// 	 if (err) {
  //           console.log('error: ', err);
  //           throw err;
  //       }for (var i in rows){
  //       	speech1 = speech1 +"\n" +rows[i].course_name+" start from "+rows[i].time_start+" to "+rows[i].time_finish;
  //       	speech1 = "wow";
  //       	//return callback(speech1);
  //       }
  //       console.log(speech1);

  //   });
    
    //connection.end();

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
        console.log(speech1);
        callback(speech1);
        return;
    });
    
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
