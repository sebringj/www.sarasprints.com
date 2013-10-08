$('head').append($('<link>',{ href: '/css/quickview.css', rel:'stylesheet' }));
$('body').append('<div class="modal fade quick-view-modal" tabindex="-1" role="dialog"></div>');
$('.quick-view-modal').modal({ show : false });
(function(context){
	// private vars go here
	var tpl = $.ajax({
		url: '/templates/quickview.html',
		success: function(data){
			context.quickView.tpl = data;
		},
		dataType: 'text'
	});
	context.quickView = {
		show : function(){
			$('.quick-view-modal').modal('show');
			return this;
		},
		hide : function() {
			$('.quick-view-modal').modal('hide');
			return this;	
		},
		set : function(product) {
			$.get('/templates/quickview.html', function(tpl){
				var output = swig.compile(tpl,{});
				var html = output(product);
				$('.quick-view-modal').html(html);	
			},'text');
			return this;
		}
	};
})(this);
