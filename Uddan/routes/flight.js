var express = require("express"),
router  = express.Router(),
con = require("../models"),
url = require('url'),
middleware = require("../middleware");

router.get("/search",function(req,res){
	var objects = url.parse(req.url,true).query;
	// console.log(objects);
	var source = objects['source'];
	var dest = objects['dest'];
	var dt = objects['depDate'];
	req.session.totalPassengers = objects['totalPeople'];
	req.session.save();
	var sql = 'SELECT *,date(Dep_dateTime) as date,time(Dep_dateTime) as dep,time(Arrival_dateTime) as arrival FROM flight_instance fi,company c,business b,economy e,flight f WHERE c.GSTR_No=f.FLGSTR_No and b.bffid=e.bffid and f.fid=b.bffid and f.fid = fi.ffid and f.source = ? and f.destination = ? and fi.Dep_dateTime LIKE ? GROUP BY fi.inst';
	//console.log(sql)
	con.query(sql,[source,dest,dt + '%'],function (err, result) {
		if (err) throw err;
		// console.log(result);
		var sources=source.toUpperCase();
		var dests=dest.toUpperCase();
		var depts=dt;
		var number=objects['totalPeople'];
		res.render("flight/flight",{flight:result,sources,dests,depts,number});
	});
	
});

// route for each specific flight
router.get("/:ffid/:Dep_dateTime",middleware.authenticationMiddleware,function(req,res){
	var objects = url.parse(req.url,true).query;
	var price = parseInt(objects['Price']);
	res.locals.price = price;
	req.session.price = price;
	req.session.save();
	// console.log(price);
	var ffid = parseInt(req.params.ffid);
	var dep = req.params.Dep_dateTime;
	// console.log(ffid,dep);
	dep = dep.split('T');
	var fd = dep[0] + " " + dep[1].split('.')[0] + "%";
	// var sql = 'SELECT * FROM flight_instance fi,business b where fi.ffid = ' + ffid+' and fi.Dep_dateTime LIKE ' + mysql.escape(fd) + 'and fi.ffid = b.bffid and fi.Dep_dateTime = b.depdate ';
	// var sql = 'SELECT * FROM flight f,flight_instance fi where fi.ffid = ? and f.fid = fi.ffid and fi.Dep_dateTime LIKE ?';
	var sql = 'SELECT f.source,f.destination,fi.ffid,fi.Dep_DateTime,fi.Arrival_DateTime,fa.Gate_No as s_gn,fa.Name as s_name,fa.City as s_city,ta.Gate_No as t_gn,ta.Name as t_name,ta.City as t_city FROM flight f,flight_instance fi,(select fa1.code,a1.Name,a1.City,fa1.Gate_No,fa1.FFID,fa1.Dep_DateTime from fromairport fa1,airport a1 where fa1.code = a1.code) as fa,(select ta1.code,a2.Name,a2.City,ta1.Gate_No,ta1.FFID,ta1.Dep_dateTime from toairport ta1,airport a2 where ta1.code = a2.code) as ta where fi.ffid = ? and f.fid = fi.ffid and fa.ffid = fi.ffid and fi.Dep_dateTime LIKE ? and fa.Dep_dateTime = fi.Dep_dateTime and ta.ffid = fi.ffid and ta.Dep_dateTime = fi.Dep_dateTime;';
	// console.log(sql);
	con.query(sql,[ffid,fd],function (err, result) {
		if (err) throw err;
		//console.log(result);
		res.render("flight/show",{f:result[0]});
	});
});

router.get("/new",function(req,res){
	if( req.isAuthenticated() && req.user["user_id"] < 3){
		res.render("flight/new");
	} else {
		res.render("404");
	}
});

router.post("/",function(req,res){
     //flight.push({"FID": parseInt(req.body.fid), "Source": req.body.source,"Destination":req.body.destination});
    var sql = 'INSERT INTO flight VALUES(?,?,?,?,?)';
    con.query(sql,[parseInt(req.body.fid),req.body.source,req.body.destination,parseInt(req.body.flgstr_no),parseInt(req.body.seating_cap)],function (err,result){
    	if (err) { console.log("Cannot create new flight"); }
    });
    
    var sql = 'INSERT INTO company VALUES(?,?,?)'
    con.query(sql,[parseInt(req.body.gstr_no),req.body.cname,req.body.caddress],function(err,result){
    	 if (err) { console.log("Cannot Enter new company"); }
    });
    
    var sql = 'INSERT INTO food VALUES(?,?,?,?,?)'
    con.query(sql,[parseInt(req.body.foodid),req.body.fname,parseInt(req.body.foodprice),parseInt(req.body.foodgstr_no),req.body.furl],function(err,result){
    	 if (err) { console.log("Cannot Enter new Food"); }
    });
    
    // console.log(req.body.arrival);
    // console.log(req.body.dep);
    if(parseInt(req.body.my)==1)
    {
	    req.body.arrival=req.body.arrival.replace('T',' ');
		req.body.dep=req.body.dep.replace('T',' ');
    }    
    //console.log(req.body.arrival); 
    // con.query(sql,[req.body.arrival],function(err,result){
    	
    // });
    var sql = 'INSERT INTO flight_instance VALUES(?,?,?,?)';
    con.query(sql,[parseInt(req.body.ffid),req.body.dep,req.body.arrival,parseInt(req.body.inst)],function (err,result){
    	if (err) { console.log("Cannot create new flight_instance"); }
    
    	sql = 'INSERT INTO fromairport VALUES(?,?,?,?,?)';
    	con.query(sql,[parseInt(req.body.fromgate),parseInt(req.body.fromcode),parseInt(req.body.ffid),req.body.dep,req.body.arrival],function (err,result){
    	    if (err) { console.log("Cannot create new fromairport"); }
    	});
    	
    	sql = 'INSERT INTO toairport VALUES(?,?,?,?,?)';
    	con.query(sql,[parseInt(req.body.togate),parseInt(req.body.tocode),parseInt(req.body.ffid),req.body.dep,req.body.arrival],function (err,result){
    	    if (err) { console.log("Cannot create new toairport"); }
    	});
    	
    	var eseat = parseInt(req.body.eseats);
    	var bseat = parseInt(req.body.bseats);
    	var ezone='E';
    	var bzone='B'
    	
    	for(var i=1;i<eseat;i++)
		{
			sql = 'INSERT INTO economy(Number,Zone,EPrice,BFFID,depdate,arrivaldate) VALUES(?,?,?,?,?,?)';	
			con.query(sql,[i,ezone,parseInt(req.body.eprice),parseInt(req.body.ffid),req.body.dep,req.body.arrival],function (err,result){
				if (err) { console.log("Cannot create new economy class"); }
			});
		}
		
		for(var i=1;i<bseat;i++)
		{
			sql = 'INSERT INTO business(Number,Zone,BPrice,BFFID,depdate,arrivaldate) VALUES(?,?,?,?,?,?)';	
			con.query(sql,[i,bzone,parseInt(req.body.bprice),parseInt(req.body.ffid),req.body.dep,req.body.arrival],function (err,result){
				if (err) { console.log("Cannot create new business; class"); }
			});
		}
		
    });
    
    res.redirect("flight/new");


});

module.exports = router;