var express = require("express"),
router  = express.Router(),
con = require("../models"),
middleware = require("../middleware");

router.get("/",middleware.authenticationMiddleware,function(req,res){
    var sql = 'SELECT * from food';
	con.query(sql, function (err, result) {
		if (err) throw err;
		// console.log(result);
		res.render("eatery/eatery",{eatery:result});
	});
});

router.get("/:Food_id",function(req,res){
    // res.render("eatery/show"); ---> res.redirect ot be added to this page
    res.redirect(req.originalUrl + "/final"); 
});

module.exports = router;