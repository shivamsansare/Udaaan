var express = require("express");
var router  = express.Router();
var passport = require("passport");
var middleware = require('../middleware');

router.get("/", function(req,res){
	// console.log( req.user );
	// console.log( req.isAuthenticated() );
	res.render("home");
});

router.get("/home", function(req,res){
	res.render("home");
});

router.get("/login",function(req,res){
	if(!req.isAuthenticated())
		res.render("passenger/login");
	else
		res.render("404");
});

router.post( "/login",passport.authenticate("local",{
	failureRedirect : "/login"
	} ),function(req,res){
		// console.log(req.originalUrl);
		var redirectTo = req.session.redirectTo || "/";
		delete req.session.redirectTo;
		res.redirect(redirectTo);
		// res.send("hello");
	} 
);

router.get("/logout",(req,res,next)=>{
	req.logout();
	req.flash("success","Successfully logged out!!");
	req.session.destroy(()=>{
		res.clearCookie('connect.sid');	
		res.redirect('/');
	});
});

router.get("/signup",function(req,res){
	res.render("passenger/signup");
});

router.get("/flight/:ffid/:Dep_dateTime/passenger/:pid",middleware.authenticationMiddleware,function(req,res){
	// console.log(req.session.price);
	// console.log(req.session.totalPassengers);
	res.locals.totalPassengers = req.session.totalPassengers;
	res.redirect(req.originalUrl+"/traveller/new");
});


module.exports = router;