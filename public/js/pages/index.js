$('.quick-view-modal').modal({ show : false });
$('.featured-products').on('click','.product', function(ev) {
	ev.preventDefault();
	var product = JSON.parse(unescape($(this).data('product')));
	quickView.set(product).show();
});