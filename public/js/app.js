hubsoft.clientid = 'sarasprints';
hubsoft.thumbNailImageIndex = 0;
hubsoft.global = { googleAnalytics : 'UA-43824235-1' };

hubsoft.ready(function(){
	hubsoft.cart.updateUI(function(){
		var count = hubsoft.cart.itemCount(),
		label = (count === 1) ? 'item' : 'items';
			
		$('.top .items [data-quantity] a').text(count + ' ' + label);
		hubsoft.getCartProducts(function(data){
			console.log(data);
			$('.top .items [data-subtotal] a').text(data.subtotal);
		});
	});	
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
	hubsoft.validateCart(function(data){
		if (!data.success) {
			hubsoft.cart.undo();
			console.log(data);
			alert(data.errors[0].message);
			//$('[data-cart-dialog]').find('.modal-body p').text(data.errors[0].message);
			//$('[data-cart-dialog]').modal('show');
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
	
	hubsoft.getProducts({
		productNumber : productNumber
	}, function(json){
		console.log(json);
		console.log($parent.length);
		$parent
			.find('[data-product-name]').text(json.product.productName).end()
			.find('[data-big-product-image]').css({ "background-image" : 'url("'+ json.product.images[0] +'")'}).end()
			.find('.product-code [data-product-number]').text(json.product.productNumber).end()
			.find('[data-sizes]').each(function(){
				var $this = $(this),
				$select = $('<select>');
				$select.append('<option value="">Select Size</option>');
				var sizes = json.product.sizes;
				for(var i = 0; i < sizes.length; i++) {
					$select.append($('<option>').text(sizes[i].sizeName).val(sizes[i].sku));
					$this.html($select.html());
				}
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
	if ($parent.closest('.modal').length) {
		$parent.closest('.modal').scrollTop(0);
	} else {
		window.scrollTo(0,0);
	}
});
$('body').on('click','.product .quick-view', function(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	var productNumber = $(this).closest('.product').data('productnumber');
	console.log(hubsoft.clientid);
	hubsoft.ready(function(){
		hubsoft.getProducts({
			productNumber : productNumber
		}, function(data) {
			
			if (!data.product) {
				alert('could not fetch product');
				return;
			}
			
		    var p = data.product,
		    	s = p.sizes[0];
		    	
		    p.unitPrice = s.unitPrice.toFixed(2);
		    p.msrp = s.msrp.toFixed(2);
		    p.isSale = (p.unitPrice < p.msrp);
		    	
			quickView.set(p).show();
		});
	});
});
$('form.subscribebar').submit(function(ev){
	ev.preventDefault();
	var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var email = $(this).find('input').val();
	if (!emailRE.test(email)) {
		$(this).find('input').css({'border-color':'red'});
		console.log('subscriber email input bad');
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
			$('.newsletter').css({visibility:'hidden'});
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
	$('.newsletter').css({visibility:'hidden'});
}