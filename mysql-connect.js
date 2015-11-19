var mysql = require('mysql');

var db = module.exports = {};

var password = process.env.RUSE_PASSWORD
var username = process.env.RUSE_USERNAME

db.getDB = function(){
  var con = mysql.createConnection({
    host     : 'ruseDB.db.10451415.hostedresource.com',
    user     : username,
    password : password,
    database : 'ruseDB'
  });

  con.connect(function(err){
    if(err) {
      console.log("Error connecting database ... \n\n" + err);
    }
    console.log("Database is connected ... \n\n");
  });

  return con;
};
