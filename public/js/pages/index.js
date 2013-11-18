$('.featured-products').on('click','.product .quick-view', function(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	var productNumber = $(this).closest('.product').data('productnumber');
	console.log(hubsoft.clientid);
	hubsoft.ready(function(){
		hubsoft.getProducts({
			productNumber : productNumber
		}, function(data) {
			
			if (!data.product) {
				alert('could not fetch product');
				return;
			}
			
		    var p = data.product,
		    	s = p.sizes[0];
		    	
		    p.unitPrice = s.unitPrice.toFixed(2);
		    p.msrp = s.msrp.toFixed(2);
		    p.isSale = (p.unitPrice < p.msrp);
		    	
			quickView.set(p).show();
		});
	});
});