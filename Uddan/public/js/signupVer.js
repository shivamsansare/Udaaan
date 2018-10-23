$("button").click(
    function(e){
        if( $("#password").val() === $("#confirmpassword") ){
            var x = $("#password").val();
            if( x.length < 10 ){
                $("#danger").empty();
                var txt = $('<div class="alert alert-danger" role="alert"><div>').text("Password Length should be more than 10");
                $("#danger").append(txt);
                e.preventDefault();
            }
        } else {
            $("#danger").empty();
            var txt = $('<div class="alert alert-danger" role="alert"><div>').text("Passwords do not match");
            $("#danger").append(txt);
            e.preventDefault();
        }
    }
);