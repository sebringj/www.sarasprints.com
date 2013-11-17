(function () {
	var cartTemplate = '', tpl;
	$.get('/templates/cart.html', function(data){
		console.log(data);
		cartTemplate = data;
		tpl = swig.compile(cartTemplate,{});
	});
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
                    alert(data.message);
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
                            alert(data.message);
                        }
                    } else {
                        if (data.errors) {
                            hubsoft.cart.undo();
                            updateCart();
                            alert(data.errors[0].message);
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