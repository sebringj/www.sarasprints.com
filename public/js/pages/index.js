$('.quick-view-modal').modal({ show : false });
$('.featured-products').on('click','.product', function(ev) {
	ev.preventDefault();
	var productNumber = $(this).data('productnumber');
	hubsoft.ready(function(){
		hubsoft.getProducts({
			productNumber : productNumber
		}, function(data) {
			quickView.set(data.product).show();
			console.log(data.product);
		});
	});
});