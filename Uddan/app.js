var bodyParser		= require('body-parser'),
	cookieParser	= require('cookie-parser'),
	con 			= require('./models'),
	local			= require('./models/passport-local-mysql'),
	express			= require("express"),
	passport		= require('passport'),
	session 		= require('express-session'),
	flash			= require('connect-flash'),
	middleware		= require('./middleware'),
	methodOverride = require('method-override'),
	app=express();

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});

var MySQLStore = require('express-mysql-session')(session);

var sessionStore = new MySQLStore({},con);

//routes variable
var indexRoutes 	= require('./routes/index'),
	passengerRoutes = require('./routes/passenger'),
	flightRoutes	= require('./routes/flight'),
	travellerRoutes = require('./routes/traveller'),
	finalRoutes 	= require('./routes/final'),
	eateryRoutes	= require('./routes/eatery'),
	paymentRoutes	= require('./routes/payment');

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
// app.use(methodOverride("_method"));
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
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
	// console.log(req.isAuthenticated());
	res.locals.isAuthenticated = req.isAuthenticated();
	if( req.isAuthenticated() ){
		res.locals.user_id = req.user["user_id"];
	}
	if( req.price ){
		res.locals.price = req.price;
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.url = req.originalUrl;
	next();
});

passport.serializeUser( local.serializeUser );
passport.deserializeUser( local.deserializeUser );
passport.use( local.strategy );

app.use("/",indexRoutes);
app.use("/passenger",passengerRoutes);
app.use("/flight",flightRoutes);
app.use("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller",middleware.correctUser,travellerRoutes);
app.use("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller/final",middleware.correctUser,finalRoutes);
app.use("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller/final/eatery",middleware.correctUser,eateryRoutes);
app.use("/flight/:ffid/:Dep_dateTime/passenger/:pid/traveller/final",middleware.correctUser,paymentRoutes);

app.get("*",function(req,res){
    res.render("404");
});

app.listen(process.env.PORT,process.env.IP,function(){
	console.log('Server is started!!!!');
});