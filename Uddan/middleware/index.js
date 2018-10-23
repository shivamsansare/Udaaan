var middlewareObj = {};

middlewareObj.authenticationMiddleware = function(req, res, next) {
	req.session.redirectTo = req.originalUrl;
	if (req.isAuthenticated()) return next();
	req.flash("error","You must be logged in!!!");
	res.redirect('/login');
};

middlewareObj.correctUser = function(req,res,next){
	if( ( !req.isAuthenticated() ) || req.user["user_id"] != req.params.pid){
		res.render("404");
	} else {
		next();
	}
};

module.exports = middlewareObj;