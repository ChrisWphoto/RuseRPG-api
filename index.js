// importing required modules
var express = require('express');
var bodyParser = require('body-parser');
var mysqlConnect = require('./mysql-connect');
var util = require('util');

//getting instance of the api router
var app = express();

// view engine setup
app.use(express.static(__dirname + '/views'));


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


function insertUser(user, cb){
  var con = mysqlConnect.getDB();
  con.query('INSERT INTO user SET ?', user, function(err, result) {
    con.end();
    if (err) return cb(err, result);
    cb(false, result); 
  });
}

function getUserById(id, cb){
  var con = mysqlConnect.getDB();
  con.query('SELECT * FROM user WHERE user_id = ?', id, function(err,rows){ 
   con.end();
   console.log('getUserByID: looking for id: ' + id + ' and rows: ' + rows);
   if (err) return cb(err,rows);
   cb(false, rows); 
  });
}




// ROUTES FOR OUR API / These wil send back json based on what url you enter
// =============================================================================

//render documentation page
app.get("/", function (req, res) {
  res.render('index');
});



app.post("/postworkout/:userid", function(req, res){
  var con = mysqlConnect.getDB();
  con.query('INSERT INTO workout SET ?', req.body, function(err, result){
    con.end();
    if (err) res.send(err);
    res.json(result);
  });
});


app.post("/postcardio", function(req, res){
  var con = mysqlConnect.getDB();
  con.query('INSERT INTO cardio SET ?', req.body, function(err, result){
    con.end();
    if (err) res.send(err);
    res.json(result);
  });
});

app.post("/poststrength", function(req, res){
  var con = mysqlConnect.getDB();
  con.query('INSERT INTO strength SET ?', req.body, function(err, result){
    con.end();
    if (err) res.send(err);
    res.json(result);
  });
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
    if (err){ console.log('/userid Param: ' + util.inspect(err, false, null)); return next(err);}
    if (rows.length < 1) return next(new Error("can't find user"));
    console.log('/userid Param: rows:  ' + util.inspect(rows, false, null));
    req.user = rows;
    return next();
  });

});


//Route for getting all workouts by a user in the last 7 days. 
app.get('/getworkouts/:userid', function(req,res){
  var con = mysqlConnect.getDB();
  var userId = req.user[0].user_id;
  console.log('/getwokouts/:userid: userId: ' + userId);
  con.query('Select strengthName,reps AS \'Duration/reps\' From lookUpStrength inner join strength on lookUpStrength.lookUpStrength_id =strength.fk_lookupStrength_id inner join workout on strength.fk_workout_id = workout.workout_id where fk_workout_user_id = ? and date_tm_complete BETWEEN SUBDATE(CURDATE(), INTERVAL 1 MONTH) AND NOW() UNION ALL Select cardioName, duration_seconds AS \'Duration/reps\' From lookUpCardio inner join cardio on lookUpCardio.lookUpCardio_id =cardio.fk_lookupCardio_id inner join workout on cardio.fk_workout_id = workout.workout_id where fk_workout_user_id = ? and date_tm_complete BETWEEN SUBDATE(CURDATE(), INTERVAL 1 MONTH) AND NOW();', [userId, userId], function(err, rows){
    con.end();
    if (err) {console.log('/getWorkout err: ' + err); res.send(err);}
    res.json(rows);
  });
});

//get User by ID
app.get("/users/:userid",function(req,res){
  res.json(req.user); 
});

app.put('/user/:userid', function(req,res){
  var con = mysqlConnect.getDB();
  var userId = req.user[0].user_id;
  con.query('UPDATE user SET ? where user_id = ?', [req.body, userId], function(err, result){
    con.end();
    if (err) {console.log('/getUser user/:userid err: ' + err); res.send(err);}
    res.json(result);
  });

});


//inserts a new user with whatever data is sent.
// example {user_id: 3, userName: 'chris', email: 'b@b.com'}
//does not need to be compelte, columns may be left blank
app.post("/postuser",function(req,res){
  console.log('/postUser: req: ' + util.inspect(req.body, false, null));
  console.log('/postUser: looking for, req.body.user_id: ' + req.body.user_id);
  getUserById(req.body.user_id, function(err, reqUser){
    if (reqUser.length < 1){
      insertUser(req.body, function(err, result){
        if(err) {console.log('/postUser err: ' + err);  res.send(err);}
        console.log('/postUser: Inserted: ' + result);
        getUserById(req.body.user_id, function(err, rows){
          if(err) {console.log('/postUser err: ' + err);  res.send(err);}
          console.log('/postUser: created new user, sending defaults: ' + rows);
          res.json(rows);
        });  
      });
    } else {console.log('/postUser: Found existing user:');  res.json(reqUser);}
  });   
});
  
  
  
  
var port = process.env.PORT || 3000;        // set our port
app.listen(port);
console.log('Listening on the port: ' + port);