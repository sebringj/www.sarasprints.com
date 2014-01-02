$('#contactusform').submit(function(ev){
	ev.preventDefault();
	var $form = $(this);
	var valid = true;
	$form.find('input,textarea').removeClass('error').each(function(){
		if ($.trim($(this).val()) === '') {
			valid = false;
			$(this).addClass('error');
		} else if ($(this).attr('type') === 'email' && !hubsoft.emailRE.test($(this).val())) {
			$(this).addClass('error');
		}
	});
	if (!valid) {
		$form.find('.alert').removeClass('alert-success').addClass('alert-danger')
		.text('Please fill out the form completely.').slideDown('fast');
		return;
	}
	$.post('/contact-us',$form.serialize())
	.done(function(json){
		console.log(json.err);
		if (json.err) {
			$form.find('.alert').removeClass('alert-success').addClass('alert-danger')
			.text('Oops. An error occurred.').slideDown('fast');
		} else {
			$form.find('.alert').addClass('alert-success').removeClass('alert-danger')
			.text('Thank you!.').slideDown('fast');
			$form.find('input,textarea').each(function(){
				$(this).val('');
			});
		}
	})
	.fail(function(){
		$form.find('.alert').removeClass('alert-success').addClass('alert-danger')
		.text('Oops. Could not connected.').slideDown('fast');
	});
});