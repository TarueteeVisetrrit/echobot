"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const restService = express();

//const mysql = require('mysql');
//create connection Code doesn't works
//const db = mysql.createConnection({
 //host     : '161.200.80.25',
 //user     : 'root',
 //password : 'ej8025ej',
 //database  : 'CTS'
//});
//connect to db Code doesn't works
//db.connect((err) =>{
  //if(err){
    //throw err;
  //}
  //console.log('Mysql connected.....');
//}); 
const restService = express();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());
// Code doesn't works
//restService.listen('3306',() =>{
  //console.log('Server started on port 3306');
//});

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


