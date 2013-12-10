$('head').append($('<link>',{ href: '/css/quickview.css', rel:'stylesheet' }));
$('body').append('<div class="modal fade quick-view-modal" tabindex="-1" role="dialog"></div>');
$('.quick-view-modal').modal({ show : false });
(function(context){
	// private vars go here
	context.quickView = {
		show : function(){
			var self = this;
			$('.quick-view-modal')
				.find('[data-colors]').each(function(){
					$(this).val(self.product.productNumber);
				}).end()
				.find('.modal-dialog').show().end().modal('show');
			return this;
		},
		hide : function() {
			$('.quick-view-modal')
				.find('.modal-dialog').hide().end().modal('hide');
			return this;	
		},
		set : function(product) {
			var output = swig.compile(this.tpl,{});
			product.unitPrice = product.sizes[0].unitPrice;
			product.msrp = product.sizes[0].msrp;
			console.log(product);
			var html = output(product);
			this.product = product;
			$('.quick-view-modal').html(html);
			$('.quick-view-modal .product-description').html(product.descriptions[0]);	
			return this;
		}
	};

	//if (location.search.indexOf('refresh') === -1 && sessionStorage['quickview-tpl']) { // added ! to this temporarily to undo caching while working on quick view
	//	context.quickView.tpl = sessionStorage['quickview-tpl'];
	//} else {
		$.ajax({
			url: '/templates/quickview.html',
			success: function(data){
				sessionStorage['quickview-tpl'] = context.quickView.tpl = data;
			},
			dataType: 'text'
		});
	//}
})(this);

