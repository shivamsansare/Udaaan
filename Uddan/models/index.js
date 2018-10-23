var mysql = require('mysql');

var con = mysql.createConnection({
	host: < "Your host ip" >,
	user: < "Your username" >,
	database: < "Your database name" >
});

module.exports = con;