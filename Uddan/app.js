var bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
mysql = require('mysql'),
express=require("express"),
url = require('url'),
passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
bcrypt = require('bcrypt'),
session = require('express-session'),
flash = require('connect-flash'),
app=express();

var MySQLStore = require('express-mysql-session')(session);

var con = mysql.createConnection({
	host: "localhost",
	user: "shivamsansare",
	database: "c9"
});


con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});

var sessionStore = new MySQLStore({},con);

const saltRounds = 10;

// https://docs.c9.io/docs/setup-a-database ---> on how to start a database
// https://www.w3schools.com/sql/sql_ref_mysql.asp ---> MySQL functions
// https://www.w3schools.com/sql/sql_create_db.asp ---> SQL database commands
// https://www.w3schools.com/nodejs/nodejs_mysql.asp ----> node.js mysql ref
// use c9 ----> command to select the database in mysql-ctl cli
// https://www.jetradar.com/flights/?marker=78606
// https://youtu.be/gYjHDMPrkWU ----> tutorials for passport on mysql


// for reference goto --------->        https://ide.c9.io/learnwithcolt/webdevbootcamp

app.use(flash());
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use( session({
	key: "This is the seesion key",
	secret : "This is just s a demo",
	store : sessionStore,
	resave : false,
	saveUninitialized : false
	// cookie : {secure : true}
}) );
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
	// console.log(req.isAuthenticated());
	res.locals.isAuthenticated = req.isAuthenticated();
	if( req.isAuthenticated() ){
		res.locals.user_id = req.user["user_id"];
	};
	if( req.price ){
		res.locals.price = req.price;
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.url = req.originalUrl;
	next();
});

passport.serializeUser(function(user_id, done) {
	done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
	done(null, user_id);
});

passport.use( new LocalStrategy({
	usernameField : "email",
	passwordField : "pwd"
	} ,
	function(username,password,done){
		// console.log(username,password);
		con.query("select pid,firstname,password from passenger where email like ?",[username],function(err,results){
			if(err) {return done(err);}
			if(results.length === 0) {return done(null,false);}
			// console.log(results[0].password.toString());
			// console.log(results[0]);
			var hash = results[0].password;
			bcrypt.compare(password,hash,function(err,res){
				if(err) throw err;
				if( res === true ){
					return done(null,{user_id : results[0].pid});
				}else{
					console.log("Password match failure");
					return done(null,false);
				}
			} );
			// return done(null,{user_id : 0});
		});
	}
) );

app.get("/", function(req,res){
	// console.log( req.user );
	// console.log( req.isAuthenticated() );
	res.render("home");
});

app.get("/home", function(req,res){
	res.render("home");
});

app.get("/login",function(req,res){
	if(!req.isAuthenticated())
		res.render("passenger/login");
	else
		res.render("404");
});

app.post( "/login",passport.authenticate("local",{
	failureRedirect : "/login"
	} ),function(req,res){
		// console.log(req.originalUrl);
		var redirectTo = req.session.redirectTo || "/";
		delete req.session.redirectTo;
		res.redirect(redirectTo);
		// res.send("hello");
	} 
);

app.get("/logout",(req,res,next)=>{
	req.logout();
	req.flash("success","Successfully logged out!!");
	req.session.destroy(()=>{
		res.clearCookie('connect.sid');	
		res.redirect('/');
	});
});

// app.get("/dashboard",function(req,res){
// 	res.render("passenger/dashboard");
// });

app.get("/signup",function(req,res){
	res.render("passenger/signup");
});

app.get("/passenger/:id",authenticationMiddleware(),function(req,res){
	if( req.params.id != req.user['user_id'] ){
		res.render("404");
	} else {
		var sql = "select * from passenger where pid = ?;";
		con.query(sql,[req.params.id],function(err,result){
			if (err) throw err;
			var r = result[0];
			sql = "select c.name,f.source,f.destination,fi.Dep_dateTime,fi.arrival_dateTime,t.firstname,t.lastname,b.ticketPrice from books b,traveller t,flight_instance fi,flight f,company c where b.passId = ? and b.bookingId = t.bookId and b.passId = t.bookingpid and b.flightId = fi.ffid and b.depDate = fi.Dep_dateTime and fi.ffid = f.fid and f.FLGSTR_No = c.GSTR_No order by bookId DESC;";
			con.query(sql,[req.params.id],function(err,result){
				if (err) throw err;
				// console.log(result);
				res.render("passenger/show",{p:r,b:result});
			});
			// console.log(result);
		});
	}
});

app.get("/passenger",function(req,res){
	if( req.isAuthenticated() && req.user['user_id'] < 3 ){
		var sql = "select * from passenger;";
		con.query(sql,function(err,result){
			if (err) throw err;
			// console.log(result);
			res.render("passenger/passenger",{passenger:result});
		});
	} else {
		res.render("404");
	}
});

app.post("/passenger",function(req,res){
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
	// check for existence of username in database
	con.query(sql,[email],function(err,result){
		if (err) return res.redirect("404");
		if( result.length > 0 ){
			req.flash("error","Email id already exists. Try to login using the same.");
			res.redirect("/login");
		} else {
			sql = 'select count(1) from passenger';
			con.query(sql,function(err,result){
				if(err) throw err;
				count = parseInt(result[0]['count(1)'])+1;
				sql = "INSERT INTO passenger (PID,age,firstname,lastname,email, phoneno, password) VALUES (?,?,?,?,?,?,?)";
				bcrypt.hash(pwd,saltRounds,function(err,hash){
					if(err) { req.flash("error","Error in saving your password try again"); res.redirect("/signup"); };
					con.query(sql,[count,age,fname,lname,email,PhoneNo,hash], function (err, result) {
						if (err) { req.flash("error","Error in saving user. Try Again"); res.redirect("/signup"); };
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

app.get("/flight/new",function(req,res){
	if( req.isAuthenticated() && req.user["user_id"] < 3){
		
		res.render("flight/new");
	} else {
		res.render("404");
	}
});

app.get("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller/eatery",authenticationMiddleware(),function(req,res){
	var sql = 'SELECT * from food';
	con.query(sql, function (err, result) {
		if (err) throw err;
		// console.log(result);
		res.render("eatery/eatery",{eatery:result});
	});
});

app.post("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller",authenticationMiddleware(),function(req,res){
	//var objects = url.parse(req.url,true).query;
	// console.log(objects);
	// console.log(req.originalUrl)\
	var pid = req.params.pid;
	var depdate = req.params.Dep_dateTime.toString();
	var ffid = req.params.ffid
	var numbers = req.session.totalPassengers;
	req.session.passengers = req.body.passengers;
	req.session.save();
	// console.log(req.session.passengers);
	// 	var sql ="INSERT INTO traveller(firstname,lastname,age,bookingpid,dep,ffid) VALUES (?,?,?,?,?,?)";
	// 	con.query(sql,[fname,lname,age,pid,depdate,ffid] , function (err, result) {
	// 		if (err) throw err;
	// 	});
	// }
	// var sql = "INSERT INTO books(check_int,ticketPrice,passId,flightId,depDate) values(?,?,?,?,?,?)";
	// con.query(sql,[0,req.session.price*numbers,pid,ffid,depdate],function(err,result){
	// 	console.log(result);
	// });
	// res.redirect(req.originalUrl + "/eatery");
	res.locals.totalPassengers=req.session.totalPassengers;
	res.locals.price=req.session.price;
	res.render("final",{f:[{name:'-',price:0}],p:req.session.passengers,food:false});
});



app.get("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller/eatery/:Food_id/final",authenticationMiddleware(),function(req,res){
	var food_id=req.params.Food_id;
	res.locals.totalPassengers=req.session.totalPassengers;
	res.locals.price=req.session.price;
	var sql ="SELECT * from food where Food_id=?";
	con.query(sql,food_id ,function (err, result) {
		if (err) {req.flash("error","Unable to process your data.Try Again");return res.redirect("/");};
		res.render("final",{f:result,p:req.session.passengers,food:true});
	});
});

//No eatery payment
app.get("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller/payment",authenticationMiddleware(),function(req,res){
	res.locals.totalPassengers=req.session.totalPassengers;
	var pid = req.params.pid;
	var depdate = req.params.Dep_dateTime.toString();
	var ffid = req.params.ffid
	var numbers = req.session.totalPassengers;
	res.locals.price = req.session.price;
	var price = res.locals.price*numbers;
	
	var sql = "INSERT INTO books(check_int,ticketPrice,passId,flightId,depDate) VALUES (?,?,?,?,?)";
	con.query(sql,[0,price,pid,ffid,depdate],function(err,result){
		if (err) throw err;
		//console.log(result);
	});
	
	var sql="SELECT LAST_INSERT_ID();"
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

	res.render("payment");
});

app.get("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller/eatery/:Food_id/final/payment",authenticationMiddleware(),function(req,res){
	res.locals.totalPassengers=req.session.totalPassengers;
	var pid = req.params.pid;
	var Food_id = req.params.Food_id;
	var depdate = req.params.Dep_dateTime.toString();
	var ffid = req.params.ffid
	var numbers = req.session.totalPassengers;
	res.locals.price = req.session.price;
	var price = res.locals.price*numbers;
	
	var sql = "INSERT INTO books(check_int,ticketPrice,passId,flightId,depDate) VALUES (?,?,?,?,?)";
	con.query(sql,[0,price,pid,ffid,depdate],function(err,result){
		if (err) throw err;
		//console.log(result);
	});
	
	var sql="SELECT LAST_INSERT_ID();"
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
	
	var sqls = "SELECT price FROM food where Food_id=?";
	con.query(sqls,[Food_id],function(err,result1){
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

		res.render("payment");
});


app.get("/flight/search",function(req,res){
	var objects = url.parse(req.url,true).query;
	// console.log(objects);
	var source = objects['source'];
	var dest = objects['dest'];
	var dt = objects['depDate'];
	req.session.totalPassengers = objects['totalPeople'];
	req.session.save();
	var sql = 'SELECT *,date(Dep_dateTime) as date,time(Dep_dateTime) as dep,time(Arrival_dateTime) as arrival FROM flight_instance fi,company c,business b,economy e,flight f WHERE c.GSTR_No=f.FLGSTR_No and b.bffid=e.bffid and f.fid=b.bffid and f.fid = fi.ffid and f.source = '+ mysql.escape(source) + 'and f.destination = '+mysql.escape(dest) + ' and fi.Dep_dateTime LIKE ' + mysql.escape(dt + '%') +'GROUP BY fi.inst';
	//console.log(sql)
	con.query(sql, function (err, result) {
		if (err) throw err;
		// console.log(result);
		var sources=source.toUpperCase();
		var dests=dest.toUpperCase();
		var depts=dt;
		var number=objects['totalPeople'];
		res.render("flight/flight",{flight:result,sources,dests,depts,number});
	});
	
	// var query= 'SELECT b.BPrice as bprice,e.BPrice,bffid as eprice WHERE b.bffid=e.bffid GROUP BY bffid'
	// con.query(sql, function (err, result1) {
	//   if (err) throw err;
	//   console.log(result1);
	//   res.render("flight/flight",{flight1:result1});
	// });
});

// app.get("/flight/:ffid/:Dep_dateTime/book",function(req,res){
// 	// console.log(req.session.price);
// 	// console.log(req.session.totalPassengers);
// 	res.locals.totalPassengers = req.session.totalPassengers;
// 	res.render("flight/book");
// });

app.get("/flight/:ffid/:Dep_dateTime/passenger/:pid",function(req,res){
	// console.log(req.session.price);
	// console.log(req.session.totalPassengers);
	res.locals.totalPassengers = req.session.totalPassengers;
	res.render("flight/book");
});


// route for each specific flight
app.get("/flight/:ffid/:Dep_dateTime",authenticationMiddleware(),function(req,res){
	var objects = url.parse(req.url,true).query;
	var price = parseInt(objects['Price']);
	res.locals.price = price;
	req.session.price = price;
	req.session.save();
	// console.log(price);
	var ffid = parseInt(req.params.ffid);
	var dep = req.params.Dep_dateTime;
	// console.log(ffid,dep);
	var result;
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

// app.get("/flight",function(req,res){
//     res.render("flight/flight",{flight:flight});
// });

 app.post("/flight",function(req,res){
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

app.get("*",function(req,res){
    res.render("404");
});

app.listen(process.env.PORT,process.env.IP,function(){
	console.log('Server is started!!!!');
});

function authenticationMiddleware() {  
	return (req, res, next) => {
		// console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
		req.session.redirectTo = req.originalUrl;
		if (req.isAuthenticated()) return next();
		req.flash("error","You must be logged in!!!");
		res.redirect('/login');
	}
}