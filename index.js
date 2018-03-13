"use strict";

const express = require("express");
var mysql = require('mysql');
const bodyParser = require("body-parser");

const restService = express();



//create connection Code doesn't works
// var db = mysql.createConnection({
//  host     : 'us-cdbr-iron-east-05.cleardb.net',
//  user     : 'bc72622898452a',
//  password : '3244bd28',
//  database: 'heroku_8d64b4cb3978d80'
// });

//db.connect();

//connect to db Code doesn't works
// db.connect((err) =>{
//   if(err){
//     throw err;
//   }
//   console.log('Mysql connected.....');
// }); 
restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);
restService.use(bodyParser.json());

restService.get("/hello",function(req,res){
	res.send('Hello world');
});

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
