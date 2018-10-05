$("#relocate_login").on("click", function relocation_signin() {
	location.href = "/login";
})

$("#relocate_signup").on("click", function relocation_signup() {
	location.href = "/signup";
})

$("#password").on("click", function password() {
  $( "#show-password" ).show( "slow" );
});