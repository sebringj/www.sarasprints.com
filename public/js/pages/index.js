$('.featured-products').on('click','.product .quick-view', function(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	var productNumber = $(this).closest('.product').data('productnumber');
	console.log(hubsoft.clientid);
	hubsoft.ready(function(){
		hubsoft.getProducts({
			productNumber : productNumber
		}, function(data) {
		    var p = data.product,
		    	s = p.sizes[0], 
		    	unitPrice = s.unitPrice,
		    	msrp = s.msrp,
		    	isSale = (unitPrice < msrp);
		    	console.log(p)
		    	
		    p.unitPrice = unitPrice.toFixed(2);
		    p.msrp = msrp.toFixed(2);
		    p.isSale = isSale;	
		    	
			quickView.set(data.product).show();
		});
	});
});