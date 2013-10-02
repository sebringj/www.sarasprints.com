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
			// todo
			return this;
		}
	};
})(this);
