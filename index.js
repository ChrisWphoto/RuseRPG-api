var express = require('express');
var mysql      = require('mysql');
var bodyParser = require('body-parser');

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var con = mysql.createConnection({
  host     : 'ruseDB.db.10451415.hostedresource.com',
  user     : 'ruseDB',
  password : 'FatEraser1!',
  database : 'ruseDB'
});

con.connect(function(err){
if(!err) {
    console.log("Database is connected ... \n\n");
} else {
    console.log("Error connecting database ... \n\n" + err);
}
});

// ROUTES FOR OUR API / These wil send back json based on what url you enter
// =============================================================================
app.get("/",function(req,res){
con.query('SELECT * from testusers', function(err, rows, fields) {

  if (!err){
    console.log('The solution is: ', rows);
    res.json(rows);
  }
  else
    console.log('Error while performing Query. ' + err );
  });

});

app.param('userid', function(req,res,next, id){
  console.log('userid: '+id);
  con.query('select * from testusers where id = ?', id, function(err,rows){
    if (err) return next(err);
    if (!rows) return next(new Error("can't find user"));
    console.log(rows);
    req.user = rows;
    return next();
  });
});

app.get("/users/:userid",function(req,res){
  console.log(req.user);
  res.json(req.user);
});


var port = process.env.PORT || 3000;        // set our port

app.listen(port);
console.log('Listening on port: ' + port);
