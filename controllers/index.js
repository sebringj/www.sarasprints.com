var getJSON = require('../lib/getJSON.js').getJSON,
	kitgui = require('kitgui'),
	path = require('path'),
	config = require('config'),
	cache = {},
	async = require('async');

module.exports.set = function(context) {
	var app = context.app;
	var year = (new Date()).getFullYear();
	var clientid = config.hubsoft.clientid;
	var kitguiAccountKey = config.kitgui.accountKey;
	
	app.get('/', function(req, res){
		function render(req, res){
			res.render('index', {
				year : year,
				seo : cache.home.kitgui.seo,
				products : cache.home.products,
				kitgui : cache.home.kitgui,
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(req.path)
			});
		}
		if (req.query.refresh) {
			delete cache.home;
		}
		if (cache.home) {
			render(req, res);
		} else {
			cache.home = {};
			async.parallel([
				function(callback) {
					getJSON({port:443, host:clientid + '.hubsoft.ws',path:'/api/v1/products?tags=Jackets'}, function(status, data) {
						var i = 0, len, product, size, removeCount, keepCount = 4;
						if (status === 200) {
							// reduce array to 4 items
							if (data.products.length >= keepCount) {
								removeCount = data.products.length - keepCount;
								data.products.splice(0,removeCount);
							}
							len = data.products.length;
							for(; i < len; i++) {
								product = data.products[i];
								size = product.sizes[0];
								if (size.msrp > size.unitPrice) {
									product.discount = true;
								}
							}
							cache.home.products = data.products;
						} else {
							cache.home = [];
						}
						callback();
					});
				}, 
				function(callback) {
					kitgui.getContents({
						basePath : config.kitgui.basePath,
						host : config.kitgui.host,
						pageID : 'home',
						items : [
							{ id : 'homeslider', editorType : 'image-rotator' }
						]
					}, function(kg){
						cache.home.kitgui = kg;
						callback();
					});
				}
			],function(err) {
				if (!err) {
					render(req, res);
				} else {
					res.redirect('/500');
				}
			});
		}
	});
	app.get('/contact-us', function(req, res) {
		res.render('contactus', {
			year : year,
			title : "Contact Us",
			clientid : clientid,
			kitguiAccountKey : kitguiAccountKey,
			kitguiPageID : getPageID(req.path)
		});
	});
	app.get(/-detail$/, function(req, res) {
		res.render('product', {
			year : year,
			title : "product",
			clientid : clientid,
			kitguiAccountKey : kitguiAccountKey,
			kitguiPageID : getPageID(req.path)
		});
	});
	app.get(/^\/(pjs-for-girls|pjs-for-boys|fuzzy-fleece|sale|up-past-8)$/, function(req, res) {
		res.render('catalog', {
			year : year,
			title : "Catalog",
			clientid : clientid,
			kitguiAccountKey : kitguiAccountKey,
			kitguiPageID : getPageID(req.path)
		});
	});
	app.get(/^\/(privacy-security|terms|return-policy|safe-and-comfortable|faq|team|story|sizing|site-map|customer-service)$/, function(req, res) {
		var prefix = getPageID(req.path);
		kitgui.getContents({
			basePath : config.kitgui.basePath,
			host : config.kitgui.host,
			req : req,
			pageID : prefix,
			items : [
				{ id : prefix + '-title', kind : 'ids', editorType : 'inline' },
				{ id : prefix + '-html', kind : 'ids', editorType : 'html' }
			]
		},function(kg){		
			res.render('content', {
				seo : kg.seo,
				title : kg.items[prefix + '-title'],
				html : kg.items[prefix + '-html'],
				year: year,
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(req.path)
			});
		});
	});
	app.get(/^\/templates\/[a-z\.A-Z0-9]+$/, function(req, res, next){
		var filename = path.resolve('./views/partials/') + '/' + req.path.split('/').pop();
		res.sendfile(filename);
	});
	app.get('/refresh', function(req, res){
		cache = {};
		res.json({ message : 'ok' });
	});
	app.use(function(req, res, next){
		res.status(404);
		if (req.accepts("html")){
			res.render('404', {
				year : year,
				title : "404 page not found",
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(req.path)
			});
			return;
		} else if (req.accepts("json")){
			res.send({ error: 'not found'});
			return;
		}
		res.type('txt').send('not found');
	});
};

function getPageID(path) {
	return path.replace(/[^a-z0-9]/gi,'-').replace(/-+/gi,'-');
}