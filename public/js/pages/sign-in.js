$('.sign-in-form').submit(function(ev){
	ev.preventDefault();
	
	var $form = $(this),
	$email = $form.find('#email'),
	email = $.trim($email.val()),
	$password = $form.find('#password'),
	password = $.trim($password.val());
	
	var emailRE = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
	
	$('.sign-in-form').find('.alert-danger').hide();
	
	console.log('email: ' + email);
	
	if (!emailRE.test(email) || password === '') {
		$('.sign-in-form').find('.alert-danger').text('Please fill in the form completely.').slideDown('fast');
		return;
	} 
	
	hubsoft.ready(function(){
		hubsoft.login({
			email : email,
			password : password
		}, function(data){
			if (!data.success) {
				$('.sign-in-form').find('.alert-danger').text(data.message).slideDown('fast');
			} else {
				
			}
			console.log(data);
		});
	});	
}).on('focus','input', function(){
	$('.sign-in-form').find('.alert-danger').slideUp('fast');
});