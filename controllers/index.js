var getJSON = require('../lib/getJSON.js').getJSON,
	kitgui = require('../lib/kitgui.js'),
	cache = {};

module.exports.set = function(context) {
	var app = context.app;
	var year = (new Date()).getFullYear();
	
	app.get('/', function(req, res){
		function render(products, req, res){
			var i = 0, len = products.length, product;
			for(; i < len; i++) {
				product = products[i];
				product.self = JSON.stringify(product);
			}
			res.render('index', {
				year : year,
				title : "Catalog",
				products : products
			});
		}
		if (cache.homeProducts) {
			render(cache.homeProducts, req, res);
		} else {
			getJSON({port:443, host:'klim.hubsoft.ws',path:'/api/v1/products?tags=Jackets'}, function(status, data) {
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
					cache.homeProducts = data.products;
					render(cache.homeProducts, req, res);
				} else {
					res.redirect('/500');
				}
			});
		}
	});
	app.get('/contactus', function(req, res) {
		res.render('contactus', {
			year : year,
			title : "Contact Us"
		});
	});
	app.get(/^\/(-detail|product)$/, function(req, res) {
		res.render('product', {
			year : year,
			title : "product"
		});
	});
	app.get(/^\/(pjs-for-girls|pjs-for-boys|fuzzy-fleece|sale|up-past-8)$/, function(req, res) {
		res.render('catalog', {
			year : year,
			title : "Catalog"
		});
	});
	app.get(/^\/(team|story|sizing-chart|site-map)$/, function(req, res) {
		kitgui.get({
				req : req,
				items: [
					{id:'title',type:'inline'},
					{id:'body',type:'html'}
				]
			}, function(data){
			res.render('content', {
				year : year,
				title : data.title,
				html : data.body
			});
		});
	});
	app.use(function(req, res, next){
		res.status(404);
		if (req.accepts("html")){
			res.render('404', {
				year : year,
				title : "404 page not found"
			});
			return;
		} else if (req.accepts("json")){
			res.send({ error: 'not found'});
			return;
		}
		res.type('txt').send('not found');
	});
};