(function (hs) { // "hs" shortcut for "hubsoft"

    function drawProduct() {
        var hash = window.location.hash.substr(1);
        hs.getProduct({
            productURL: hash
        }, function (data) {
            document.title = data.product.productName;
            $('#product-breadcrumb').text(data.product.productName);
            $('h1').text(data.product.productName);
            var html = new EJS({ element: 'productTemplate' }).render(data);
            $('#product').html(html);
            $('.product-image').zoom({ icon: true, url: $('.product-image img').data('big') });
        });
    }

    if (sessionStorage['products-breadcrumb']) {
        if (sessionStorage['products-breadcrumb'].indexOf(',') === -1) {
            $('#products-breadcrumb').attr('href', './products.htm#' + sessionStorage['products-breadcrumb'])
                .text(sessionStorage['products-breadcrumb']);
        }
    }

    hs.cart.triggerUpdateUI();
    hs.ready(function () {
        //drawProduct();
    });

    // events
    $('body').on('click', '.product-add-to-cart', function (ev) {
	    ev.preventDefault();
        var sku = $('.select-size select').val();
        var qty = $('.equal-product').html();

        if (sku === "") {
            alert('select a size');
            return;
        }
        hs.cart.snapshot();
        hs.cart.addQuantity(sku, parseInt(qty));

        hs.validateCart(function (data) {
            if (!data.success) {
                hs.cart.undo();
                drawProduct();
                if (data.errors && data.errors.length) {
                    alert(data.errors[0].message);
                }
                return;
            }
            window.location = './cart';
        });
    });
})(hubsoft);