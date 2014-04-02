$('.forgot-password-form').submit(function(ev){
	ev.preventDefault();
	
	var $form = $(this),
	$email = $form.find('#email'),
	email = $.trim($email.val());
	
	var emailRE = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
	
	$form.find('.alert-danger').hide();
	
	console.log('email: ' + email);
	
	if (!emailRE.test(email)) {
		$form.find('.alert-danger').text('Please fill in the form completely.').slideDown('fast');
		return;
	} 
	
	hubsoft.ready(function(){
		hubsoft.resetPassword({
			email : email
		}, function(data){
			if (!data.success) {
				$form.find('.alert-danger').text(data.message.split(':')[1]).slideDown('fast');
			} else {
				$form.find('.alert-danger')
					.removeClass('alert-danger')
					.addClass('alert-success')
					.text('Please check your email inbox.').slideDown('fast');
			}
			console.log(data);
		});
	});	
}).on('focus','input', function(){
	$(this).closest('form').find('.alert-danger').slideUp('fast');
});