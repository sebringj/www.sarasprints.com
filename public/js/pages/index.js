$('.featured-products').on('click','.product', function(ev) {
	ev.preventDefault();
	var productNumber = $(this).data('productnumber');
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