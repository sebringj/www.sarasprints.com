var getJSON = require('../lib/getJSON.js').getJSON,
	kitgui = require('kitgui'),
	path = require('path'),
	config = require('config'),
	cache = {},
	async = require('async'),
	fs = require('fs');

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
				productColors : cache.home.productColors,
				kitgui : cache.home.kitgui.items,
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
					getJSON({port:443, host:clientid + '.hubsoft.ws',path:'/api/v1/productColors'}, function(status, data) {
						var i = 0, len, productColor, size, removeCount, keepCount = 4;
						if (status === 200) {
							// reduce array to 4 items
							console.log(data)
							if (!data || !data.length) { 
								cache.home.productColors = [];
								callback();
								return; 
							}
							if (data.length >= keepCount) {
								removeCount = data.length - keepCount;
								data.splice(0,removeCount);
							}
							len = data.length;
							for(; i < len; i++) {
								productColor = data[i];
								size = productColor.colors[0].sizes[0];
								if (size.msrp > size.unitPrice) {
									productColor.discount = true;
								}
							}
							cache.home.productColors = data;
						} else {
							cache.home.productColors = [];
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
	app.get('/cart', function(req, res) {
		function render() {
			res.render('cart', {
				year : year,
				title : "Cart",
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(req.path),
				seo : cache.cart.kitgui.seo,
				kitgui : cache.cart.kitgui.items,
				breadcrumb : [
					{ link : '/', label: 'home' },
					{ label: 'cart'}
				]
			});	
		}
		if (req.query.refresh) {
			delete cache.cart;
		}
		if (cache.cart) {
			render();
		} else {
			cache.cart = {};
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : 'cart'
			}, function(kg){
				if (!kg.seo) {
					kg.seo = {};
				}
				cache.cart.kitgui = kg;
				render();
			});
		}
	});
	app.get('/checkout', function(req, res){
		res.render('checkout', {
			title : 'checkout'
		});
	});
	app.get('/contact-us', function(req, res) {
		function render() {
			res.render('contactus', {
				year : year,
				title : "Contact Us",
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(req.path),
				kitgui : cache.contact.kitgui.items,
				seo : cache.contact.kitgui.seo,
			});
		}
		if (req.query.refresh) {
			delete cache.contact;
		}
		if (cache.contact) {
			render();
		} else {
			cache.contact = {};
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : 'contact-us',
				items : [
					{ id : 'contactuswording', editorType : 'inline' }
				]
			}, function(kg){
				cache.contact.kitgui = kg;
				render();
			});
		}
	});
	app.get(/-detail$/, function(req, res) {
		
		function renderProduct(product) {
			res.render('product', {
				year : year,
				title : product.productName,
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(req.path),
				product : product,
				seo : { title : product.productName, description : product.metaDescription }
			});
		}
		
		if (!req.query.refresh && cache[req.path]) {
			renderProduct(cache[req.path]);
		} else {
			getJSON({port:443, host:clientid + '.hubsoft.ws',path:'/api/v1/products?productURL=' + req.path}, function(status, data) {
				cache[req.path] = data.product;
				renderProduct(cache[req.path]);
			}, function() {
				res.redirect('/500');
			});
		}
		
	});
	app.get(/^\/(pjs-for-girls|pjs-for-boys|fuzzy-fleece|sale|up-past-8)$/, function(req, res) {
		
		var productColors = [];
		var seo = {};
		var kg = {};
		
		var tag = req.path.split('/').pop();
		
		function render() {
			res.render('catalog', {
				year : year,
				title : "Catalog",
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : tag,
				productColors : productColors,
				seo: seo,
				kitgui : kg
			});			
		}
		
		async.parallel([
			function(callback){
				getJSON({port:443, host:clientid + '.hubsoft.ws',path:'/api/v1/productColors?tags=' + tag}, function(data){
					productColors = data;
					callback();
				});
			},
			function(callback) {
				kitgui.getContents({
					basePath : config.kitgui.basePath,
					host : config.kitgui.host,
					pageID : tag,
					items : [
						{ id : tag + '-header', editorType : 'inline' },
						{ id : tag + '-boxtitle', editorType : 'inline' },
						{ id : tag + '-boxdescription', editorType : 'inline' }
					]
				}, function(result){
					kg = {
						header : result.items[tag + '-header'],
						boxtitle : result.items[tag + '-boxtitle'],
						boxdescription : result.items[tag + '-boxdescription']
					};
					seo = result.seo;
					callback();
				});
			}
		],
		function(err){
			render();
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
		fs.exists(filename, function (exists) {
			if (!exists) {
				res.end('dne');
				return;
			}
			var stream = fs.createReadStream(filename);
			stream.pipe(res);
		});
	});
	app.get('/refresh', function(req, res){
		cache = {};
		res.json({ message : 'ok' });
	});
	app.get('/500',function(req, res){
		res.render('500', {})
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
	app.use(function(err, req, res, next){
		res.status(err.status || 500);
		console.log(err);
		res.render('500', { error: err });
	});
};

function setCache(req, cache, key) {
	if (req.query.refres) {
		delete cache[key];
	}
	if (!cache[key]) {
		cache[key] = {};
	}
}

function getPageID(path) {
	return path.replace(/[^a-z0-9]/gi,'-').replace(/-+/gi,'-');
}