var express = require("express"),
router  = express.Router(),
con = require("../models"),
middleware = require('../middleware'),
nodemailer = require('nodemailer'),
ejs = require("ejs");

var transporter = nodemailer.createTransport({
	service: <"Domain name">,
	auth: {
		user: <"Your email id">,
		pass: <"Your password">
	}
});


router.get("/payment",middleware.authenticationMiddleware,function(req,res){
	res.locals.totalPassengers=req.session.totalPassengers;
	// console.log(req.originalUrl);
	var params = req.originalUrl.split("/");
	var pid = params[5];
	var depdate = params[3].toString();
	var ffid = params[2];
	var numbers = req.session.totalPassengers;
	res.locals.price = req.session.price;
	var price = res.locals.price*numbers;
	// console.log(params);
	var sql = "INSERT INTO books(check_int,ticketPrice,passId,flightId,depDate) VALUES (?,?,?,?,?)";
	con.query(sql,[0,price,pid,ffid,depdate],function(err,result){
		if (err) throw err;
		//console.log(result);
	});
	
	sql="SELECT LAST_INSERT_ID();";
	con.query(sql,function(err,result){
		if (err) throw err;
		//console.log(result);
		Object.keys(result).forEach(function(key) {
	    	var ids = result[key];
	    	var id=ids['LAST_INSERT_ID()'];
	    	for(var i=0;i<numbers;i++)
			{
				var fname = req.session.passengers[i]['firstname'];
				var lname = req.session.passengers[i].lastname;
				var age = req.session.passengers[i].age;
				sql ="INSERT INTO traveller(firstname,lastname,age,bookingpid,dep,ffid,bookId) VALUES (?,?,?,?,?,?,?)";
				con.query(sql,[fname,lname,age,pid,depdate,ffid,id] , function (err, result) {
					if (err) throw err;
				});
			}
		});
	});
	
	//emailing ticket
	sql = "select pass.firstname as firstname,pass.email as email from passenger pass where pass.PID = ?;";
	con.query(sql,[pid],function(err,result){
		// console.log(pid,result);
		if(err) { req.flash("error","Could not email the ticket to you");return res.redirect("/home"); }
		req.session.final.pass = result[0];
		req.session.final.pass.totalPassengers = parseInt(req.session.totalPassengers);
		req.session.final.flight.price = req.session.price;
		// console.log(req.session.final.pass.totalPassengers,req.session.final.flight.price);
		req.session.save();
		ejs.renderFile(__dirname + "/../views/mailTicketContent.ejs",req.session.final,function(err,data){
			if(err) console.log(err);
			var mailOptions = {
				from: 'Udaaan by D&S <"Add your email id here">',
				to: result[0]['email'],
				subject: ('Ticket booking record dt : ' + (new Date()).toString() ),
				html : data
			};
			// https://stackoverflow.com/questions/41304922/sending-ejs-template-using-nodemailer#   ---> to send ejs file
			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					req.flash('error','Failed');
					return res.redirect('/passenger/'+pid);
				}
			});
		});
	});
	res.render("payment");
});

router.get("/eatery/:Food_id/final/payment",middleware.authenticationMiddleware,function(req,res){
	res.locals.totalPassengers=req.session.totalPassengers;
	// console.log(req.originalUrl);
	var Food_id = req.params.Food_id;
	var params = req.originalUrl.split("/");
	var pid = params[5];
	var depdate = params[3].toString();
	var ffid = params[2];
	var numbers = req.session.totalPassengers;
	res.locals.price = req.session.price;
	var price = res.locals.price*numbers;
	
	var sql = "INSERT INTO books(check_int,ticketPrice,passId,flightId,depDate) VALUES (?,?,?,?,?)";
	con.query(sql,[0,price,pid,ffid,depdate],function(err,result){
		if (err) throw err;
		//console.log(result);
	});
	
	sql="SELECT LAST_INSERT_ID();";
	con.query(sql,function(err,result){
		if (err) throw err;
		//console.log(result);
		Object.keys(result).forEach(function(key) {
	    	var ids = result[key];
	    	var id=ids['LAST_INSERT_ID()'];
	    	for(var i=0;i<numbers;i++)
			{
				var fname = req.session.passengers[i]['firstname'];
				var lname = req.session.passengers[i].lastname;
				var age = req.session.passengers[i].age;
				sql ="INSERT INTO traveller(firstname,lastname,age,bookingpid,dep,ffid,bookId) VALUES (?,?,?,?,?,?,?)";
				con.query(sql,[fname,lname,age,pid,depdate,ffid,id] , function (err, result) {
					if (err) throw err;
				});
			}
		});
	});
	
	sql = "SELECT price FROM food where Food_id=?";
	con.query(sql,[Food_id],function(err,result1){
		if (err) throw err;
		Object.keys(result1).forEach(function(key) {
    	var eatprice = result1[key];
    	var eprice=eatprice.price;
    	//console.log(eatprice.price);
    	
    	var sql = "INSERT INTO orders(passId,foodId,flightId,depDate,totalPrice) VALUES (?,?,?,?,?)";
		con.query(sql,[pid,Food_id,ffid,depdate,eprice*numbers],function(err,result){
			if (err) throw err;
			});
    	});
	});
	
	//emailing ticket
	sql = "select pass.firstname as firstname,pass.email as email from passenger pass where pass.PID = ?;";
	con.query(sql,[pid],function(err,result){
		// console.log(pid,result);
		if(err) { req.flash("error","Could not email the ticket to you");return res.redirect("/home"); }
		req.session.final.pass = result[0];
		req.session.final.pass.totalPassengers = parseInt(req.session.totalPassengers);
		req.session.final.flight.price = req.session.price;
		// console.log(req.session.final.pass.totalPassengers,req.session.final.flight.price);
		req.session.save();
		ejs.renderFile(__dirname + "/../views/mailTicketContent.ejs",req.session.final,function(err,data){
			if(err) console.log(err);
			var mailOptions = {
				from: 'Udaaan by D&S <"Add your eamil id here too">',
				to: result[0]['email'],
				subject: ('Ticket booking record dt : ' + (new Date()).toString() ),
				html : data
			};
			// https://stackoverflow.com/questions/41304922/sending-ejs-template-using-nodemailer#   ---> to send ejs file
			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					req.flash('error','Failed');
					return res.redirect('/passenger/'+pid);
				}
			});
		});
	});
	
	res.render("payment");
});

module.exports = router;