<!DOCTYPE html>
<html>
<head>
	<title>Airline Reservation system</title>
	
	<!--meta tag for responsiveness-->
	<!--<meta name="viewport" content="width=device-width, initial-scale=1.0">-->
	<meta charset="utf-8">
	<!--<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">-->
	
	<!--Bootstrapv4.0 CDN-->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
	<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>

	<!-- Logo -->
	<link rel="shortcut icon" type="image/png" href="Uddan/public/stylesheets/logo.png">
	
	<!-- Emoji stylesheet -->
	<!--<link href="https://afeld.github.io/emoji-css/emoji.css" rel="stylesheet">-->
	
	<!-- Icon -->
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
	
	<!-- Custom -->
	<link rel = "stylesheet" href = "Uddan/public/stylesheets/home.css">

</head>
<body>

	<!--<p>This is header.</p>-->
	<nav class = "navbar navbar-expand-lg">
		<div class = "container">
			<!-- for home icon-->
			<a class = "navbar-brand" href = "/" style="color:white"><i class="fas fa-home" color="white"></i>Home</a>
			<button class="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
				<i class="fas fa-sliders-h"></i>
			</button>
			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class = "navbar-nav ml-auto">

						<li class = "nav-item"><a class = "nav-link" href="#" data-toggle="modal" data-target="#signupwindow" style="color:white">Login<i class="fas fa-sign-in-alt"></i></a></li>
						<li class = "nav-item"><a class = "nav-link" href="#" data-toggle="modal" data-target="#popUpWindow" style="color:white">Signup<i class="fas fa-user-plus"></i></a></li>
				
				</ul>
			</div>
		</div>
	</nav>
	<form role="form" id = "entered" action="/passenger" method="POST">
		<div class="modal fade" id="popUpWindow">
		<div class="modal-dialog">
			<div class="modal-content">

				<!-- header -->
				<div class="modal-header">
					<h3 class="modal-title">Signup Page</h3>
					<button type="button" class="close" data-dismiss="modal">&times;</button>
				</div>

				<!-- body (form) -->
				<div class="modal-body">
						<div class="form-group">
							<input type="email" class="form-control" id="emailid" placeholder="Enter email" name="signup[email]" required>
						</div>
						<div class="form-group">
							<input type="number" class="form-control" id="Phone No." placeholder="Enter Phone No." name="signup[PhoneNo]" required>
						</div>
						<div class="form-group">
							<input type="text" class="form-control" id="First Name" placeholder="Enter First Name" name="signup[FirstName]" required>
						</div>
						<div class="form-group">
							<input type="text" class="form-control" id="Last Name" placeholder="Enter Last Name" name="signup[LastName]" required>
						</div>
						<div class="form-group">
							<input type="text" class="form-control" id="Age" placeholder="Enter Age" name="signup[age]" required>
						</div>
						<div class="form-group">
						  <input type="password" class="form-control" id="password" placeholder="Enter password" name="signup[pwd]" Required>
						</div>
						<div class="form-group">
						  <input type="password" class="form-control" id="confirmpassword" placeholder="Confirm password" name="signup[cpwd]" Required>
						</div>
	  <!--                  <div class="checkbox">-->
					 <!--     <label><input type="checkbox" name="remember"> Remember me</label>-->
						<!--</div>-->
						<div class="modal-footer">
							<button class="btn btn-primary btn-block" type = "submit">Submit</button>
						</div>
				</div>

				<!-- button -->
			</div>
		</div>
		</div>
	</form>
	
	<form role = "form" action = "/login" method = "POST">
	<div class="modal fade" id="signupwindow">
		<div class="modal-dialog">
			<div class="modal-content">

				<!-- header -->
				<div class="modal-header">
					<h3 class="modal-title">Login Page</h3>
					<button type="button" class="close" data-dismiss="modal">&times;</button>
				</div>

				<!-- body (form) -->
				<div class="modal-body">
						<div class="form-group">
							<input type="email" class="form-control" id="email" placeholder="Enter email" name="email" required>
						</div>
						<div class="form-group">
							<input type="password" class="form-control" id="pwd" placeholder="Enter password" name="pwd" Required>
						</div>
						<div class="form-group">
							<input type="password" class="form-control" id="cpwd" placeholder="Re-Enter password" name="cpwd" Required>
						</div>
						<!--<div class="checkbox">-->
					 <!--   	<label><input type="checkbox" name="remember"> Remember me</label>-->
						<!--</div>-->
				</div>

				<!-- button -->
				<div class="modal-footer">
					<button class="btn btn-primary btn-block" type = "submit">Submit</button>
				</div>

			</div>
		</div>
	</div>
	</form>


	<!-- jQuery CDN -->
	<link rel = "stylesheet" href = "Uddan/public/stylesheets/search.css">
	
	<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
	
	<script type = "text/javascript" src = "Uddan/public/js/effect.js"></script>
	
	
	<div class = "container">
		<form action = "/flight/search" method = "get">
			<div>
				<input class = "search-form from" type = "text" name = "source" placeholder = "Source" REQUIRED>
			</div>
			<div class="switch-places"></div>
			<div class="to">
				<input class = "search-form" type = "text" name = "dest" placeholder = "Destination" required>
			</div>
			<div class="date">	
				<!--*/ %>-->
				<input class = "search-form" type = "date" name = "depDate" placeholder = "Departure Date" >
			</div>
			<div class="options">
				<input class = "search-form" type = "number" name = "totalPeople" placeholder = "No. Of People" required min = "1">
			</div>
			<button class="search-button btn btn-primary" type="submit" data-metric="search-form submit">Find</button>
		</form>
	</div>
		
	<div class = "container" id = "cards">
		<div class="row panel text-center">
		   <div class="col-lg-4 col-md-4 col-sm-6" style="padding:10px">            
				
				<div  class="img-thumbnail img-fluid thumb-div">

					<div id="slideshow">
					
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-16.jpg" style="width:100%">
						</div>
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-11.jpg" style="width:100%">
						</div>
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-14.jpg" style="width:100%">
						</div>
						
					</div>
					<div class="hello-div">	
						<h5 class="card-title">
							Delhi
						</h5>
						<h6 class = "card-title">
							Cheapest flights to Delhi
							 <br>
							Upto 10% off
						</h6>
					</div>

				</div>
			  
			</div>
			
			<div class="col-lg-4 col-md-4 col-sm-6" style="padding:10px">            
				
				<div  class="img-thumbnail img-fluid thumb-div">
					
					<div id="slideshow1">
					
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-11.jpg" style="width:100%">
						</div>
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-14.jpg" style="width:100%">
						</div>
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-16.jpg" style="width:100%">
						</div>
						
					</div>	
					
					<div class="hello-div">	
						<h5 class="card-title">
							Mumbai
						</h5>
						<h6 class = "card-title">
							Cheapest flights to Mumbai
							<br>
							Upto 20% off
						</h6>
					</div>
				</div>
			  
			</div>
			
			<div class="col-lg-4 col-md-4 col-sm-6" style="padding:10px">            
				
				<div  class="img-thumbnail img-fluid thumb-div flip-card">
					
					<div id="slideshow2">
					
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-14.jpg" style="width:100%">
						</div>
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-16.jpg" style="width:100%">
						</div>
						<div>
							<img class="card-img-top mySlides1" src="https://imgak.mmtcdn.com/pwa-hlp/assets/img/hlp/deals/ic-flight-11.jpg" style="width:100%">
						</div>
					</div>
															
					<div class="hello-div">	
						<h5 class="card-title">
							Chennai
						</h5>
						<h6 class = "card-title">
							Cheapest flights to Chennai
							<br>
							Upto 15% off
						</h6>
					</div>
				</div>
			  
			</div>
			
			
		</div>
	</div>
	
	<script>
		$("#slideshow > div:gt(0)").hide();
		
		setInterval(function() {
		  $('#slideshow > div:first')
		    .fadeOut(2000)
		    .next()
		    .fadeIn(2000)
		    .end()
		    .appendTo('#slideshow');
		}, 4000);
		
	</script>	
	
	<script>
		$("#slideshow1 > div:gt(0)").hide();
		
		setInterval(function() {
		  $('#slideshow1 > div:first')
		    .fadeOut(2000)
		    .next()
		    .fadeIn(2000)
		    .end()
		    .appendTo('#slideshow1');
		}, 4000);
	
	</script>	
	
	<script>		
	
		$("#slideshow2 > div:gt(0)").hide();
		
		setInterval(function() {
		  $('#slideshow2 > div:first')
		    .fadeOut(2000)
		    .next()
		    .fadeIn(2000)
		    .end()
		    .appendTo('#slideshow2');
		}, 4000);
	</script>
	<!-- http://getbootstrap.com/docs/4.1/components/card/ for adding offers and ads -->
	
<!--</div>-->


	<!--<footer class = "footer bg-dark navbar-dark" style = "postion:absolute;bottom:0;color:white;left:0">-->
	<footer class = "footer">
	    <center>
			<strong>TradeMark 2018.Made by <i class="fab fa-dyalog"></i><i class="fab fa-d-and-d"></i><i class="fab fa-stripe-s"></i></strong>
		</center>
	</footer>
</body>
</html>
