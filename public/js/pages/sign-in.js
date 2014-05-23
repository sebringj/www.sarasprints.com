$('.sign-in-form').submit(function(ev){
	ev.preventDefault();
	
	var $form = $(this),
	$email = $form.find('#email'),
	email = $.trim($email.val()),
	$password = $form.find('#password'),
	password = $.trim($password.val());
	
	var emailRE = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
	
	$form.find('.alert-danger').hide();
	
	console.log('email: ' + email);
	
	if (!emailRE.test(email) || password === '') {
		$form.find('.alert-danger').text('Please fill in the form completely.').slideDown('fast');
		return;
	} 
	
	hubsoft.ready(function(){
		hubsoft.login({
			email : email,
			password : password
		}, function(data){
			if (!data.success) {
				$form.find('.alert-danger').text(data.message).slideDown('fast');
			} else {
				hubsoft.scriptRedirect('/my-account');
			}
			console.log(data);
		});
	});	
}).on('focus','input', function(){
	$(this).closest('form').find('.alert-danger').slideUp('fast');
});