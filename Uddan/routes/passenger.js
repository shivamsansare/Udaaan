var express = require("express");
var router  = express.Router();
var con = require("../models");
var bcrypt = require('bcrypt');
var middleware = require('../middleware'),
nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: <"Domain name">,
	auth: {
		user: <"Your email id">,
		pass: <"Your password">
	}
});

const saltRounds = 10;

router.get("/:pid",middleware.correctUser,function(req,res){
	var sql = "select * from passenger where pid = ?;";
	con.query(sql,[req.params.pid],function(err,result){
		if (err) throw err;
		var r = result[0];
		sql = "select c.name,f.source,f.destination,fi.Dep_dateTime,fi.arrival_dateTime,t.firstname,t.lastname,b.ticketPrice from books b,traveller t,flight_instance fi,flight f,company c where b.passId = ? and b.bookingId = t.bookId and b.passId = t.bookingpid and b.flightId = fi.ffid and b.depDate = fi.Dep_dateTime and fi.ffid = f.fid and f.FLGSTR_No = c.GSTR_No order by bookId DESC;";
		con.query(sql,[req.params.pid],function(err,result){
			if (err) { req.flash("error","Error while loading user data");return res.redirect("/home"); }
			// console.log(result);
			res.render("passenger/show",{p:r,b:result});
		});
	});
});

router.get("/:pid/edit",middleware.correctUser,function(req,res){
	//display edit form for passenger
	var sql = "select * from passenger where pid = ?;";
	con.query(sql,[req.params.pid],function(err,result){
		if(err) { req.flash("error","Error while loading user data");return res.redirect("/home"); }
		res.render("passenger/edit",{p:result[0]});
	});
});

router.get("/:pid/delete",middleware.correctUser,function(req,res){
	//display edit form for passenger
	req.logout();
	req.flash("success","Successfully logged out!!");
	req.session.destroy(()=>{
		res.clearCookie('connect.sid');	
		res.redirect('/');
	});
	var sql = "delete from passenger where pid = ?;";
	con.query(sql,[req.params.pid],function(err,result){
		if(err) { req.flash("error","Error while deleting user data");return res.redirect("/home"); }
		res.redirect("/home");
	});
});

router.put("/:pid",middleware.correctUser,function(req,res){
	var sql = "select * from passenger where pid = ?";
	con.query(sql,[req.params.pid],function(err,results){
		if(err) { req.flash("error","SQL error");return res.redirect("/home");}
		var password = req.body.signup["pwd"];
		var hash = results[0].password;
		bcrypt.compare(password,hash,function(err,ress){
				if(err) throw err;
				if( ress === false ){
					req.flash("error","Password match failure");
					return res.redirect(req.originalUrl + "/edit");
				}
				sql = "update table set age = ?,firstname = ?,lastname = ?,email = ?,phoneno = ? where pid = ?";
				con.query(sql,[req.body.signup["age"],req.body.signup["FirstName"],req.body.signup["LastName"],req.body.signup["email"],req.body.signup["PhoneNo"],req.body.params.pid]);
			} );
	});
});

router.get("/",function(req,res){
	if( req.isAuthenticated() && req.user['user_id'] < 3 ){
		var sql = "select * from passenger;";
		con.query(sql,function(err,result){
			if (err) { req.flash("error","SQL query error");return res.redirect("/home"); }
			// console.log(result);
			res.render("passenger/passenger",{passenger:result});
		});
	} else {
		res.render("404");
	}
});

router.post("/",function(req,res){
	var email=req.body.signup["email"],
	PhoneNo=req.body.signup["PhoneNo"],
	pwd = req.body.signup["pwd"],
	fname = req.body.signup["FirstName"],
	lname = req.body.signup["LastName"],
	age = req.body.signup["age"],
	sql = 'select pid from passenger where email = ?',
	count = 0;
	if( pwd != req.body.signup["cpwd"] ){
		req.flash("error","Password does not match try again");
		return res.redirect("/signup");
	}
	if( pwd === req.body.signup["cpwd"] && pwd.length < 10 ){
		req.flash("error","Length of password should be more than 10");
		return res.redirect("/signup");
	}
	if( PhoneNo.length != 10 ){
		req.flash("error","Invalid telephone number");
		return res.redirect("/signup");
	}
	if( age > 100 || age < 0){
		req.flash("error","Age has to be greater than 0 and less than 100");
		return res.redirect("/signup");
	}
	// check for existence of username in database
	con.query(sql,[email],function(err,result){
		if (err) return res.redirect("404");
		if( result.length > 0 ){
			req.flash("error","Email id already exists. Try to login using the same.");
			res.redirect("/login");
		} else {
			var mailOptions = {
				from: 'Udaaan by D&S <"Add your mail id here too">',
				to: email,
				subject: 'Welcome to Udaaan by D&S!!!',
				text: ('Dear ' + fname + ',\n\tWelcome to Udaaan by D&S. We hope that this relationship of ours goes on beyond time. We want you to know that we value your time and privacy. Feel free to book airline ticket for you and your family. For any enquiry visit our page login and visit the contact us section under profile page.\nThanking you,\nD&S<3')
			};
			// https://stackoverflow.com/questions/41304922/sending-ejs-template-using-nodemailer#   ---> to send ejs file
			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					req.flash('error','Failed');
					return res.redirect('/signup');
				}			});
			sql = 'select count(1) from passenger';
			con.query(sql,function(err,result){
				if(err) throw err;
				count = parseInt(result[0]['count(1)'])+1;
				sql = "INSERT INTO passenger (PID,age,firstname,lastname,email, phoneno, password) VALUES (?,?,?,?,?,?,?)";
				bcrypt.hash(pwd,saltRounds,function(err,hash){
					if(err) { req.flash("error","Error in saving your password try again"); res.redirect("/signup"); }
					con.query(sql,[count,age,fname,lname,email,PhoneNo,hash], function (err, result) {
						if (err) { req.flash("error","Error in saving user. Try Again"); res.redirect("/signup"); }
						var user_id = { user_id : count };
						// console.log(user_id);
						req.login(user_id,function(err){
							if(err) throw err;
							req.flash("success","You have been successfully registered with us!!!!");
							res.redirect("/");
						});	// end of login
					});	//end of user save query
				});	//end of password hash	
			});	// end of count query
		}	//end of else
	});		//end of email check query
	
	// res.redirect("/passenger");
});


module.exports = router;