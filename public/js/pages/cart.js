(function () {
	var cartTemplate = $('#carttemplate').html(), tpl;
	tpl = swig.compile(cartTemplate,{});
	
    function updateCart() {
        hubsoft.getCartProducts(function (data) {
            var i, len, item;
            data.subtotal = 0;
            if (data.items != null && data.items.length > 0) {
                for (i = 0, len = data.items.length; i < len; i++) {
                    item = data.items[i];
					item.subtotal = (item.unitPrice * item.quantity);
                    data.subtotal += item.subtotal;
                }
                $('#cartList').html(tpl(data));
            }
            if (!data.items || data.items == null || hubsoft.cart.items.length === 0) {
                $('#cartList').html(tpl({ subtotal: 0, items: [] }));
                $('#cart').fadeOut('fast', function () {
                    $('#no-items').fadeIn('fast');
                });
            } else {
            	$('#cart').show();
            }
        });
    }

    hubsoft.ready(function () {
        updateCart();
        hubsoft.validateCart(function (data) {
            if (data.success) {
                if (data.message) {
					if (!sessionStorage.showShippingMessage) {
                    	$('.modal-cart').modal('show').find('.modal-body p').text(data.message);
						sessionStorage.showShippingMessage = '1';
					}
                }
            }
        });
    });

    $('body').on('click', '#cart button.btn-close', function (ev) {
        var $tr = $(this).closest('tr'), sku = $tr.data('sku');
        hubsoft.cart.remove(sku);
        $tr.fadeOut('fast', function () {
            $tr.remove();
            updateCart();
        });
    }).on('keypress', '#cart input.qty', function (ev) {
        if (ev.which !== 0 && ev.which !== 8 && (ev.which < 48 || ev.which > 57)) {
            return false;
        }
    }).on('keyup', '#cart input.qty', function (ev) {
        var val, sku = $(this).closest('tr').data('sku');
        if (ev.which >= 48 && ev.which <= 57) {
            val = parseInt($(this).val());
            if (val === 0) {
                hubsoft.cart.remove(sku);
            } else {
                hubsoft.cart.snapshot();
                hubsoft.cart.set(sku, val);
                hubsoft.validateCart(function (data) {
                    if (data.success) {
                        if (data.message) {
							if (!sessionStorage.showShippingMessage) {
                            	$('.modal-cart').modal('show')
								.find('.modal-body p.alert')
									.removeClass('alert-danger')
									.addClass('alert-info').text(data.message);
								sessionStorage.showShippingMessage = '1';
							}
                        }
                    } else {
                        if (data.errors && data.errors.length) {
                            hubsoft.cart.undo();
                            updateCart();
                        	$('.modal-cart').modal('show')
							.find('.modal-body p.alert')
								.removeClass('alert-info')
								.addClass('alert-danger').text('The requested quantity is not available.');
                        }
                    }
                });
            }
            updateCart();
        }
    }).on('blur', '#cart input.qty', function (ev) {
        updateCart();
    });
})();