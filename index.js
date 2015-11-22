// importing required modules
var express = require('express');
var bodyParser = require('body-parser');
var mysqlConnect = require('./mysql-connect');

//getting instance of the api router
var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// ROUTES FOR OUR API / These wil send back json based on what url you enter
// =============================================================================


//returns all users when root url is visted
app.get("/",function(req,res){
  res.send("<h2>Welcome! :) Ruse Api is Running</h2> <p><b>/users/1</b> retrieves user 1 by id</p><p><b>/lookupcardio</b> retrieves all cardio</p><p><b>/lookupstrength</b> retrieves all strength</p><p><b>/postuser</b> send http post her to inser a new user send data in this format {user_id: 5, userName: 'Tony', email: 'm@m.com'} </p>");
});

//returns all cardio exercises when root url is visted
app.get("/lookupcardio",function(req,res){
  var con = mysqlConnect.getDB();

  con.query('SELECT * from lookUpCardio', function(err, rows, fields) {
    con.end();
    if (err) throw err;
    res.json(rows);
    });

});

//returns all cardio exercises when root url is visted
app.get("/lookupstrength",function(req,res){
  var con = mysqlConnect.getDB();

  con.query('SELECT * from lookUpStrength', function(err, rows, fields) {
    con.end();
    if (err) throw err;
    res.json(rows);
    });

});


//Middleware for the routes. Check for existence of user and then passes user
//to next route.
app.param('userid', function(req,res,next, id){
  var con = mysqlConnect.getDB();
  
  con.query('select * from user where user_id = ?', id, function(err,rows){
    con.end();
    if (err){ return next(err); console.log('err in next');}
    if (rows.length < 1) return next(new Error("can't find user"));
    console.log(rows.length);
    req.user = rows;
    return next();
  });

});

//receiver of above middleware
app.get("/users/:userid",function(req,res){
  res.json(req.user); 
});


//inserts a new user with whatever data is sent.
// example {user_id: 3, userName: 'chris', email: 'b@b.com'}
//does not need to be compelte, columns may be left blank
//TODO FindOrCreate method for logging. 
app.post("/postuser",function(req,res){
  var con = mysqlConnect.getDB();
  //select query if return size is 0
  //create and send back user data. 
  con.query('INSERT INTO user SET ?', req.body, function(err, result) {
    con.end();
  
    if (err) throw err;
    res.json(result);
    });

});


var port = process.env.PORT || 3000;        // set our port
app.listen(port);
console.log('Listening on port: ' + port);
