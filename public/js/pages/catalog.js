(function(){
	
	var originalHref = '/';
	
	function setInputState(tags) {
		$('input[type=checkbox]:checked').prop('checked',false);
		$('input[type=checkbox]').each(function(){
			var $this = $(this),
			val = $this.val();
			for(var i = 0; i < tags.length; i++) {
				if (tags[i] === val) {
					$this.prop('checked',true);
				}
			}
		});
	}
	setInputState(tags);
	
	function setProducts(tags,skip) {
		var href = '/' + tags.join('/');
		if (tags.length === 0) {
			href = '/shop-pajamas'
		}
		var $div = $('<div>');
		$div.load(href + ' .productColors', function(){
			$('.productColors').html($div.find('.productColors').html());
			if (!skip) {
				console.log('pushState');
				history.pushState({
				    href: href,
					tags : tags,
				    context: 'catalog'
				}, document.title, href);			
			}
			$('.topnav a').removeClass('selected');
			$('.topnav a[href="'+ href +'"]').addClass('selected');
		})
	}
	
	$('input[type=checkbox]').click(function(){
		var tags = [];
		$('input[type=checkbox]').each(function(){
			$(this).removeData('justclicked');
		});
		$(this).data('justclicked',true);
		var $cur = $(this).closest('.checkbox')
		while($cur.hasClass('checkbox')) {
			$cur = $cur.prev();
		}
		$cur = $cur.next();
		while($cur.hasClass('checkbox')) {
			if (!$cur.find('input').data('justclicked')) {
				$cur.find('input').prop('checked',false);
			}
			$cur = $cur.next();
		}
		$('input[type=checkbox]:checked').each(function(){
			tags.push($(this).val());
		});
		setProducts(tags);
	});
	
	
	if (history.pushState) {
		(function(){
		    $(window).on("popstate", function (ev) {
		        if (!ev.originalEvent.state) {
		            return;
		        }
				var state = ev.originalEvent.state;
		        if (state.context === 'catalog') {
					setInputState(state.tags);
					setProducts(tags,true);
		        }
		    });
		})();
		history.replaceState({
		    href: location.href,
			tags : tags,
		    context: 'catalog'
		}, document.title, location.href);
	}
})();