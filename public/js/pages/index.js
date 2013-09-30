$('.quick-view-modal').modal({ show : false });
$('.featured-products').on('click','.product', function(ev) {
	ev.preventDefault();
	var productNumber = $(this).data('productnumber');
	console.log(productNumber);
	$('.quick-view-modal').modal('show');
});