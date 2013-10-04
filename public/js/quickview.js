$('head').append($('<link>',{ href: '/css/quickview.css', rel:'stylesheet' }));
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
			var tpl = $('#quick-view-template').html();
			var output = swig.compile(tpl,{});
			//var output = swig.render(tpl, { filename: '/tpl', locals: { stuff: 'awesome' }});
			var html = output(tpl,{ locals: { product: product }});
			$('.quick-view-modal').html(html);
			return this;
		}
	};
})(this);
