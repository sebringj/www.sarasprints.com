$('head').append($('<link>',{ href: '/css/quickview.css', rel:'stylesheet' }));
$('body').append('<div class="modal fade quick-view-modal" tabindex="-1" role="dialog"></div>');
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
			var output = swig.compile(quickView.tpl);
			var html = output(product);
			$('.quick-view-modal').html(html);
			return this;
		}
	};
})(this);
