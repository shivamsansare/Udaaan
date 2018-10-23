var express = require("express"),
router  = express.Router(),
middleware = require('../middleware');

router.post("/",middleware.authenticationMiddleware,function(req,res){
	req.session.passengers = req.body.passengers;
	req.session.final = {f:[{name:'-',price:0}],p:req.session.passengers,food:false};
	req.session.save();
	res.redirect(req.originalUrl + '/final');
});

router.get("/new",function(req,res){
    res.locals.totalPassengers = req.session.totalPassengers;
	res.render("traveller/new");
});

module.exports = router;