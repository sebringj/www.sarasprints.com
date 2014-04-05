hubsoft.ready(function(){
	if (!hubsoft.isLoggedIn()) {
		return location = '/sign-in';
	}
	hubsoft.getUserInfo(function(data){
		if (!data.success) {
			return location = '/sign-out';
		}
		sessionStorage['username'] = data.userInfo.firstName;
		$('#accountContent').html(sarasprints.nunjucks.render('partials/account.html', data));
	});
});

$('body').on('submit', '#changePasswordForm', function(ev) {
	
	ev.preventDefault();
	
    var $form = $(this),
        oldPassword = $.trim($('#oldPassword').val()),
        newPassword = $.trim($('#newPassword').val());
		

    $form.find('.alert').hide();

    if (oldPassword === '' || newPassword === '') {
        return $form.find('.alert-danger').text('Please fill out the required fields.').slideDown('fast');
    }

    if (oldPassword === newPassword) {
       return $form.find('.alert-error').text('Old and new passwords must be different.').slideDown('fast');
    }

    if (newPassword.length < 5) {
        return $form.find('.alert-error').text('New password is too short.').slideDown('fast');
    }

    hubsoft.changePassword({
        oldPassword : oldPassword,
        newPassword : newPassword
    }, function(data) {
        var message;
        if (data.success) {
            $form.find('.alert-success').text('Password has been changed').slideDown('fast');
            $form.find('input').val('');
            $form.find('button')[0].focus();
        } else {
            if (data.message.indexOf(':') > -1) {
                message = data.message.split(':')[1];
            } else {
                message = data.message;
            }
            $form.find('.alert-danger').text(message).slideDown('fast');
        }
    });
}).on('focus','#changePasswordForm input', function(){
	$('#changePasswordForm .alert').slideUp('fast');
}).on('click', '#promotions a', function(ev){
    ev.preventDefault();
    hubsoft.cart.clearCookie();
    hubsoft.setPromotion({promotion: $(this).data('promotion')});
    window.location = './shop-pajamas';
})