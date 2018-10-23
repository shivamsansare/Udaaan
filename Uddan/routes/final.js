var express = require("express"),
router  = express.Router(),
con = require("../models"),
middleware = require('../middleware');

router.get("/",middleware.authenticationMiddleware,function(req,res){
	res.locals.totalPassengers=req.session.totalPassengers;
	res.locals.price=req.session.price;
	var params = req.originalUrl.split("/");
	var depdate = params[3];
	var ffid = params[2];
	depdate = depdate.split('T');
	var fd = depdate[0] + " " + depdate[1].split('.')[0] + "%";
	var sql = 'SELECT f.source,f.destination,fi.ffid,fi.Dep_DateTime,fi.Arrival_DateTime,fa.Gate_No as s_gn,fa.Name as s_name,fa.City as s_city,ta.Gate_No as t_gn,ta.Name as t_name,ta.City as t_city FROM flight f,flight_instance fi,(select fa1.code,a1.Name,a1.City,fa1.Gate_No,fa1.FFID,fa1.Dep_DateTime from fromairport fa1,airport a1 where fa1.code = a1.code) as fa,(select ta1.code,a2.Name,a2.City,ta1.Gate_No,ta1.FFID,ta1.Dep_dateTime from toairport ta1,airport a2 where ta1.code = a2.code) as ta where fi.ffid = ? and f.fid = fi.ffid and fa.ffid = fi.ffid and fi.Dep_dateTime LIKE ? and fa.Dep_dateTime = fi.Dep_dateTime and ta.ffid = fi.ffid and ta.Dep_dateTime = fi.Dep_dateTime;';
	con.query(sql,[ffid,fd],function (err, result) {
		if (err) { req.flash("error","Unable to load flight data");return res.redirect("/home"); }
		//console.log(result);
		req.session.final.flight = result[0];
		req.session.save();
		// console.log(fd,result[0]);
		res.render("final",req.session.final);
	});
});

router.get("/eatery/:id/final",function(req,res){
    var food_id=req.params.id;
	res.locals.totalPassengers=req.session.totalPassengers;
	res.locals.price=req.session.price;
	var params = req.originalUrl.split("/");
	var depdate = params[3];
	var ffid = params[2];
	depdate = depdate.split('T');
	var fd = depdate[0] + " " + depdate[1].split('.')[0] + "%";
	var sql = 'SELECT f.source,f.destination,fi.ffid,fi.Dep_DateTime,fi.Arrival_DateTime,fa.Gate_No as s_gn,fa.Name as s_name,fa.City as s_city,ta.Gate_No as t_gn,ta.Name as t_name,ta.City as t_city FROM flight f,flight_instance fi,(select fa1.code,a1.Name,a1.City,fa1.Gate_No,fa1.FFID,fa1.Dep_DateTime from fromairport fa1,airport a1 where fa1.code = a1.code) as fa,(select ta1.code,a2.Name,a2.City,ta1.Gate_No,ta1.FFID,ta1.Dep_dateTime from toairport ta1,airport a2 where ta1.code = a2.code) as ta where fi.ffid = ? and f.fid = fi.ffid and fa.ffid = fi.ffid and fi.Dep_dateTime LIKE ? and fa.Dep_dateTime = fi.Dep_dateTime and ta.ffid = fi.ffid and ta.Dep_dateTime = fi.Dep_dateTime;';
	con.query(sql,[ffid,fd],function (err, result) {
		if (err) { req.flash("error","Unable to load flight data");return res.redirect("/home"); }
		//console.log(result);
		sql ="SELECT * from food where Food_id=?";
		con.query(sql,food_id ,function (err, result1) {
			if (err) {req.flash("error","Unable to load eateries.Try Again");return res.redirect("/");}
			req.session.final = {f:result1,p:req.session.passengers,food:true,flight:result[0]};
			req.session.save();
			res.render("final",req.session.final);
		});
	});
});

module.exports = router;