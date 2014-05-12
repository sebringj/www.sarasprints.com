var secured = [ '/cart','/checkout' ];

module.exports.set = function(context){
	
	// ensure proper SSL/nonSSL for SEO and security
	context.app.use(function(req, res, next){
		if (req.get('host').indexOf('localhost') === 0) { return next(); }
		if (req.host === 'www.sarasprints.com' || req.host === 'sarasprints.jit.su') {
			return res.redirect(301,'http://sarasprints.com' + req.originalUrl);
		}
		next();
	});
	
};