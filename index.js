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
  con = mysqlConnect.getDB();

  con.query('SELECT * from testusers', function(err, rows, fields) {
    con.end();
    if (err) throw err;
    res.json(rows);
    });

});

//Middleware for the routes. Check for existence of user and then passes user
//to next route.
app.param('userid', function(req,res,next, id){
  con = mysqlConnect.getDB();
  console.log('userid: '+id);

  con.query('select * from testusers where id = ?', id, function(err,rows){
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


var port = process.env.PORT || 3000;        // set our port
app.listen(port);
console.log('Listening on port: ' + port);
