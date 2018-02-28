"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();


var mysql = require('mysql');
//create connection Code doesn't works
var db = mysql.createConnection({
 host     : 'heroku_8d64b4cb3978d80',
 user     : 'bc72622898452a',
 password : '3244bd28',
});

db.connect();

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



restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
