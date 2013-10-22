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
			console.log(product);
			// hack to overcome raw and safe options not working	
			$('.quick-view-modal .product-description').html(product.descriptions[0]);
			
			// This adds and subtracts quantities to be ordered
			$('.quick-view-modal .product-next a').off().on('click',function(event){
				event.preventDefault();
				var val = $('.equal-product').html();
				if($(this).children().html() === "-" && val > 0) {
					val--;
				} else if($(this).children().html() === "+") {
					val++;
				}
				$('.equal-product').html(val);
			});
			
			//Change Size Skus when Product material/color changes
			$('.pattern-dropdown').change(function() {
				var newsizes = "";
				for (var i=0; i<product.sizes.length; i++) {
					newsizes += '<option value="'+product.sizes[i].sku+'">'+product.sizes[i].sizeName+'</option>';
				}
				$('.size-dropdown').html(newsizes);
			});			
			return this;
		}
	};

	if (location.search.indexOf('refresh') === -1 && sessionStorage['quickview-tpl']) { // added ! to this temporarily to undo caching while working on quick view
		context.quickView.tpl = sessionStorage['quickview-tpl'];
	} else {
		$.ajax({
			url: '/templates/quickview.html',
			success: function(data){
				sessionStorage['quickview-tpl'] = context.quickView.tpl = data;
			},
			dataType: 'text'
		});
	}
})(this);

