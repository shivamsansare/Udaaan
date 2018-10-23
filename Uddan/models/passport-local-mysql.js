var con = require('../models'),
LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var local = {};

local.strategy = new LocalStrategy({
	usernameField : "email",
	passwordField : "pwd"
	} ,
	function(username,password,done){
		// console.log(username,password);
		con.query("select pid,firstname,password from passenger where email like ?",[username],function(err,results){
			if(err) {return done(err);}
			if(results.length === 0) {return done(null,false);}
			var hash = results[0].password;
			bcrypt.compare(password,hash,function(err,res){
				if(err) throw err;
				if( res === true ){
					return done(null,{user_id : results[0].pid});
				}else{
				// 	console.log("Password match failure");
					return done(null,false);
				}
			} );
			// return done(null,{user_id : 0});
		});
	}
);

local.deserializeUser = function(user_id, done) {
	done(null, user_id);
};

local.serializeUser = function(user_id, done) {
	done(null, user_id);
};

module.exports = local;