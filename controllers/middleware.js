var secured = [ '/cart','/checkout' ];

module.exports.set = function(context){
	
	// ensure proper SSL/nonSSL for SEO and security
	context.app.use(function(req, res, next){
		if (req.get('host').indexOf('localhost') === 0) { return next(); }
		if (req.host === 'www.sarasprints.com' || req.host === 'sarasprints.jit.su') {
			return res.redirect(301,'http://sarasprints.com' + req.originalUrl);
		}
		var isSSL = (req.get('x-forwarded-proto') === 'https');
		var i, found = false;
		for(i = 0; i < secured.length; i++) {
			if (req.path === secured[i]) {
				found = true;
			}
		}
		var redirectPart = req.get('host') + req.originalUrl;
		if (isSSL && !found) {
			return res.redirect(301,'http://' + redirectPart);
		} else if (!isSSL && found) {
			return res.redirect(301,'https://' + redirectPart);
		}
		next();
	});
	
};