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
			var backimage = 'url('+product.images[0]+')';
			$('.big-product-image').css({"background-image" : backimage, "background-size" : "contain", "background-repeat" : "no-repeat", "background-position" : "50% 50%" });	
			
			//This adds and subtracts quantities to be ordered
			$('.product-next a').click(function(event){
				event.preventDefault();
				var val = $('.equal-product').html();
				if($(this).children().html() == "-" && val>0) {
					val--;
				} else if($(this).children().html() == "+") {
					val++;
				}
				console.log(val);
				$('.equal-product').html(val);
			});
			
			return this;
		}
	};

	if (sessionStorage['quickview-tpl']) { // added ! to this temporarily to undo caching while working on quick view
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

