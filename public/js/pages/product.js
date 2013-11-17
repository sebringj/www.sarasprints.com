hubsoft.ready(function(){
	$('.pattern-dropdown').change(function(){
		var $this = $(this),
		productNumber = $this.val();
		if (productNumber === '') {
			return;
		}
		hubsoft.getProducts({
			productNumber : productNumber
		}, function(json){
			console.log(json);
		});
	});
});