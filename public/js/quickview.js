$('head').append($('<link>',{ href: '/css/quickview.css', rel:'stylesheet' }));
$('body').append('<div class="modal fade quick-view-modal" tabindex="-1" role="dialog"></div>');
$('.quick-view-modal').modal({ show : false });
(function(context){
	// private vars go here
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
			var output = swig.compile(this.tpl,{});
			var html = output(product);
			$('.quick-view-modal').html(html);	
			return this;
		}
	};

	if (sessionStorage['quickview-tpl']) {
		context.quickView.tpl = sessionStorage['quickview-tpl'];
	} else {
		$.ajax({
			url: '/templates/quickview.html',
			success: function(data){
				context.quickView.tpl = data;
				sessionStorage['quickview-tpl'] = data;
			},
			dataType: 'text'
		});
	}
})(this);
