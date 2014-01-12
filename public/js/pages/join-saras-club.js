(function(){
	var year = (new Date()).getFullYear();
	for(var i = 0; i < 15; i++) {
		$('select[name="year"]').append($('<option>').val(year).text(year));
		year--;
	}
	var childHtml = $('<div>').append($('<div class="row child">').append($('.child').html())).html();
	$('.child').remove();
	$('.add-child a').click(function(ev){
		ev.preventDefault();
		$('.row.add-child').before(childHtml);
		$('.child:last').find('.form-inline').append('<div class="form-group">' +
		'<a href="#" class="remove-child btn btn-danger btn-xs"> <i class="fa fa-minus-circle"></i> Remove</a></div>');
	});
	$('form').on('click','.child a.remove-child', function(ev){
		ev.preventDefault();
		$(this).closest('.child').remove();
		$('.err-msg').slideUp('fast');
	}).submit(function(ev){
		ev.preventDefault();
		var $form = $(this);
		var valid = true;
		var $errMsg = $('.err-msg');
		$form.find('input[required],select[required]').closest('.form-group').removeClass('error')
		.closest('.form-group').removeClass('error').end().end()
		.each(function(){
			var $input = $(this),
			val = $.trim($input.val());
			if (val === '') {
				$input.closest('.form-group').addClass('error').closest('.child').addClass('error');
				valid = false;
			}
		});
		if (!valid) { 
			$errMsg.text('Please fill out the required(*) fields.').slideDown('fast');
			return; 
		}
		$errMsg.slideUp('fast');
		
		// serialize
		var data = {};
		$form.find('input[id],select[id]').each(function(ev){
			var $this = $(this);
			var val = $.trim($this.val());
			if (val !== '') {
				data[$this.attr('id')] = $this.val();
			}
		});
		if ($('.child').length) {
			data.children = [];
			$('.child').each(function(){
				var $child = $(this);
				var obj = {
					name : $child.find('[data-name]').val(),
					gender : $child.find('[data-gender]').val(),
					month : $child.find('[data-month]').val(),
					day : $child.find('[data-day]').val(),
					year : $child.find('[data-year]').val()
				};
				data.children.push(obj);
			});
		}
		console.log(data);
		$.post('/join-saras-club',{ data : JSON.stringify(data) })
		.done(function(json){
			if (!json.err) {
				$('.club-ui').hide();
				$('#successMsg').show();
				window.scrollTo(0,0);
			} else {
				console.log(json.err);
				$errMsg.text('We could not subscribe you at this time.').slideDown('fast');
			}
		})
		.fail(function(){
			$errMsg.text('We could not subscribe you at this time.').slideDown('fast');
		});

	}).on('focus','input,select', function(){
		$(this).closest('.form-group').removeClass('error')
		.closest('.child').removeClass('error');
		$(this).closest('form').find('.err-msg').slideUp('fast');
	});
})();