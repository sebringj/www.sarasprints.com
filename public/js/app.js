hubsoft.clientid = 'sarasprints';

hubsoft.ready(function(){
	hubsoft.cart.updateUI(function(){
		var count = hubsoft.cart.itemCount(),
		label = (count === 1) ? 'item' : 'items';
			
		$('.top .items [data-quantity]').text(count + ' ' + label);
		hubsoft.getCartProducts(function(data){
			console.log(data);
			$('.top .items [data-subtotal]').text(data.subtotal);
		});
	});	
	hubsoft.cart.triggerUpdateUI();
});

$('body').on('click','[data-add-to-cart]',function(ev){
	ev.preventDefault();

	var $this = $(this),
	sku = $this.data('sku');

	hubsoft.cart.snapshot();
	hubsoft.cart.add(sku);
	hubsoft.validateCart(function(data){
		if (!data.success) {
			hubsoft.cart.undo();
			console.log(data);
			$('[data-cart-dialog]').find('.modal-body p').text(data.errors[0].message);
			$('[data-cart-dialog]').modal('show');
		} else {
			location = '/cart';
		}
	});
});