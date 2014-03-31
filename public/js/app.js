hubsoft.clientid = 'sarasprints';
hubsoft.thumbNailImageIndex = 0;
hubsoft.global = { googleAnalytics : 'UA-43824235-1' };
hubsoft.emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

if (sessionStorage.subtotal && sessionStorage.label) {
	$('.cart [data-quantity]').text(sessionStorage.label);
	$('.cart [data-subtotal]').text(sessionStorage.subtotal);
}

hubsoft.ready(function(){
	hubsoft.cart.updateUI(function(){
		var count = hubsoft.cart.itemCount(),
		label = (count === 1) ? 'item' : 'items';
		sessionStorage.label = count + ' ' + label;
		$('.cart [data-quantity]').text(sessionStorage.label);
		hubsoft.getCartProducts(function(data){
			var subtotal = 0;
			console.log(data);
			try {
				for(var i = 0; i < data.items.length; i++) {
					subtotal += (data.items[i].unitPrice * data.items[i].quantity);
				}
			} catch(ex) {
				subtotal = 0;
			}
			sessionStorage.subtotal = '$' + subtotal.toFixed(2);
			$('.cart [data-subtotal]').text(sessionStorage.subtotal);
		});
	});	
	if (hubsoft.isLoggedIn()) {
		$('.signedin').css('display','inline-block');
	} else {
		$('.signedout').css('display','inline-block');
	}
	hubsoft.cart.triggerUpdateUI();
});

$('a[href]').each(function(){
	var $this = $(this),
	href = $this.attr('href'),
	path = location.pathname;
	if (href === '/' && path === '/') {
		$this.addClass('selected');
		return;
	} else if (href === '/') {
		return;
	} else if (path.indexOf(href) === 0) {
		$this.addClass('selected');
	}
});

$('body').on('click','[data-add-to-cart]',function(ev){
	ev.preventDefault();

	var $this = $(this),
	sku = $this.data('sku'),
	quantity = ($this.data('qty')) ? parseInt($this.data('qty')) : 1,
	$parent = $this.closest('[data-product]');
	
	if (!sku) {
		if ($parent.length) {
			$parent.find('[data-required]')
				.fadeIn('fast').fadeOut('fast').fadeIn('fast').fadeOut('fast');
		}
		return;
	}

	hubsoft.cart.snapshot();
	hubsoft.cart.set(sku,quantity);
	hubsoft.validateCart(function(data) {
		if (!data.success) {
			if (data.message === 'connection error') {
				hubsoft.cart.clearCookie();
			} else {
				hubsoft.cart.undo();
				$('[data-global-dialog]').find('.modal-body p')
					.addClass('alert-danger')
					.removeClass('alert-info').text('quantity not available');
				$('[data-global-dialog]').modal('show');
			}
		} else {
			location = '/cart';
		}
	});
}).on('click','[data-increment],[data-decrement]', function(ev){
	ev.preventDefault();
	var $this = $(this),
		$parent = $this.closest('[data-product]'),
		$addToCart = $parent.find('[data-add-to-cart]'),
		$quantity = $parent.find('[data-quantity]'),
		quantity = parseInt($quantity.text());
	if ($this.filter('[data-increment]').length) {
		quantity++;
	} else {
		quantity--;
	}
	if (quantity < 1) { 
		quantity = 1; 
	} else if (quantity > 10) { 
		quantity = 10; 
	}
	$quantity.text(quantity+'');
	$addToCart.data('qty',quantity);
}).on('change','[data-colors]', function(ev){
	var $this = $(this),
	$parent = $this.closest('[data-product]'),
	productNumber = $this.val(),
	$addToCart = $parent.find('[data-add-to-cart]');
	$addToCart.removeData('sku');
	
	if (!productNumber) { 
		return; 
	}
	
	$('span[data-productnumber]').text( productNumber );
	
	
	hubsoft.getProducts({
		productNumber : productNumber
	}, function(json){
		console.log(json.product.productName);
		var product = json.product;
		var size = product.sizes[0];
		$parent
			.find('[data-big-product-image]').css({ "background-image" : 'url("'+ product.images[0] +'")'}).end()
			.find('.product-code [data-product-number]').text(product.productNumber).end()
			.find('[data-product-unit-price]').text('$' + size.unitPrice.toFixed(2)).end()
			.find('[data-product-msrp]').text('$' + size.msrp.toFixed(2)).end()
			.find('[data-sizes]').each(function(){
				var $this = $(this),
				$select = $('<select>');
				$select.append('<option value="">Select Size</option>');
				var sizes = json.product.sizes;
				for(var i = 0; i < sizes.length; i++) {
					if (sizes[i].inStockNow) {
						$select.append($('<option>').text(sizes[i].sizeName).val(sizes[i].sku));
					} else {
						$select.append($('<option disabled>').text(sizes[i].sizeName + ' (out of stock)').val(sizes[i].sku));
					}
					$this.html($select.html());
				}
			});
			
			if (size.msrp > size.unitPrice) {
				$parent.find('[data-product-msrp]').show();
				$parent.find('[data-product-unit-price]').addClass('sale');
			} else {
				$parent.find('[data-product-msrp]').hide();
				$parent.find('[data-product-unit-price]').removeClass('sale');
			}
			
			var wording = (json.product.inStock) ? 'Availability: In Stock' : 'Availability: Out of Stock';
			$('.product-availability span').text(wording);
			$('.right-column .description').html( json.product.descriptions[0] );
		var $div = $('<div>');
		$div.load(json.product.productURL + ' [data-detail-div]', function() {
			$('.right-column .description').html( $div.find('.description').html() );
			$('[data-product-name]').text( $div.find('[data-product-name]').text() );
		});
	});
	
}).on('change','[data-sizes]', function(ev){
	console.log('size change');
	var $this = $(this),
	$parent = $this.closest('[data-product]'),
	$addToCart = $parent.find('[data-add-to-cart]');
	if ($this.val() === '') {
		$addToCart.removeData('sku');
		return;
	}
	$addToCart.data('sku',$this.val());
}).on('click','[data-color]', function(ev){
	ev.preventDefault();
	var $this = $(this),
	$parent = $this.closest('[data-product]'),
	productNumber = $this.data('productnumber');
	
	$parent.find('[data-colors]').val(productNumber).trigger('change');
});
$('body').on('click','.product .quick-view', function(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	var productURL = $(this).closest('a').attr('href');
	var $div = $('<div>');
	$div.load(productURL + ' [data-detail-div]', function() {
		$('.quick-view-modal').find('.modal-body').html($div.find('[data-detail-div]').html());
		$('.quick-view-modal').modal('show');
		$('.quick-view-modal select.pattern-dropdown option[data-href="'+ productURL +'"]').get(0).selected = true;
	});
});
$('form.subscribebar').submit(function(ev){
	ev.preventDefault();
	var email = $(this).find('input').val();
	if (!hubsoft.emailRE.test(email)) {
		$(this).find('input').css({'border-color':'red'});
		return;
	}
	
	function subscribeAnswer(title, message) {
		
	}
	
	$.post('/subscribe', { email: email }, function(data){
		var $dialog = $('[data-global-dialog]'),
		title, message;
		if (!data.error) {
			title = 'Success!';
			message = 'Thank you for subscribing!';
			$('input[name=subscribeemail],button.subscribetext').prop('disabled',true);
			sessionStorage.hideSubscribe = '1';
		} else {
			title = 'Oops.';
			message = 'We were unable to subscribe you.';
		}
		$dialog.find('.modal-title').text(title).end()
			.find('.modal-body p').text(message).end()
		.modal('show');
	}).always(function(){
		
	});
});
$('form.subscribebar input').focus(function(){
	$(this).css({'border-color':''});
});
if (sessionStorage.hideSubscribe) {
	$('input[name=subscribeemail],button.subscribetext').prop('disabled',true);
}

$('.top .cart').click(function(){
	location = '/cart';
});