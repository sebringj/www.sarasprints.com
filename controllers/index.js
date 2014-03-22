var getJSON = require('../lib/getJSON.js').getJSON,
	kitgui = require('kitgui'),
	path = require('path'),
	config = require('config'),
	cache = {},
	async = require('async'),
	fs = require('fs'),
	emailer = require('../lib/email.js'),
	htmlEncode = function(str) {
		if (!str) { return ''; }
		return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	};
	
	var styles2To14 = ['1010','2997','4901','4900','1489','1488','5575','1503'];
	var styles2To16 = ['1010','2997','4901','4900','1489','1488','5575','1503','1556','1557'];
	var styles12mTo14m = ['1600','1530'];
	
	var filterLookup = {
		'3-month-olds' : [],
		'6-month-olds' : [],
		'9-month-olds' : [],
		'12-month-olds' : styles12mTo14m,
		'18-month-olds' : [],
		'24-month-olds' : styles2To14,
		'2-year-olds' : styles2To14,
		'3-year-olds' : styles2To14,
		'4-year-olds' : styles2To14,
		'5-year-olds' : styles2To14,
		'6-year-olds' : styles2To14,
		'7-year-olds' : styles2To14,
		'8-year-olds' : styles2To14,
		'10-year-olds' : styles2To14,
		'12-year-olds' : styles2To14,
		'14-year-olds' : styles2To14,
		'16-year-olds' : styles2To16
	};

module.exports.set = function(context) {
	var app = context.app;
	var year = (new Date()).getFullYear();
	var clientid = config.hubsoft.clientid;
	var kitguiAccountKey = config.kitgui.accountKey;
	var mailchimp = context.mailchimp;
	
	function commonFlow(options) {
		
		var kitguiItems = [];
		if (options.items) {
			kitguiItems = options.items;
		}
		
		function render() {
			options.res.render(options.template, {
				year : year,
				title : options.pageID,
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(options.req.path),
				kitgui : cache[options.cacheKey].kitgui.items,
				seo : cache[options.cacheKey].kitgui.seo,
			});
		}
		if (options.req.query.refresh || options.req.cookies.kitgui) {
			delete cache[options.cacheKey];
		}
		if (cache[options.cacheKey]) {
			render();
		} else {
			cache[options.cacheKey] = {};
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : options.pageID,
				items : kitguiItems
			}, function(kg){
				cache[options.cacheKey].kitgui = kg;
				render();
			});
		}
	}
	
	app.get('/', function(req, res){
		function render(req, res){
			res.render('index.html', {
				year : year,
				seo : cache.home.kitgui.seo,
				productColors : cache.home.productColors,
				kitgui : cache.home.kitgui.items,
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(req.path)
			});
		}
		if (req.query.refresh || req.cookies.kitgui) {
			delete cache.home;
		}
		if (cache.home) {
			render(req, res);
		} else {
			cache.home = {};
			async.parallel([
				function(callback) {
					getJSON({port:443, host:clientid + '.hubsoft.ws',path:'/api/v1/productColors?tags=new'}, function(status, data) {
						var i = 0, len, productColor, size, removeCount, keepCount = 5;
						if (status === 200) {
							// reduce array to 4 items
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
							var colors = [], j, color;
							for(i = 0; i < data.length; i++) {
								if (data[i].colors.length && data[i].colors[0].sizes.length) {
									color = data[i].colors[0];
									color.discount = data[i].discount;
									color.size = color.sizes[0];
									color.image = color.images[0];
									colors.push(data[i].colors[0]);
								}
							}
							cache.home.productColors = colors;
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
							{ id : 'homeslider3', editorType : 'bootstrap-carousel-json' },
							{ id : 'homeTitle', editorType : 'inline' },
							{ id : 'homeHTML', editorType : 'html' }
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
			res.render('cart.html', {
				year : year,
				title : "Cart",
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : getPageID(req.path),
				seo : cache.cart.kitgui.seo,
				kitgui : cache.cart.kitgui.items,
				cartFile : cache.cart.cartFile,
				breadcrumb : [
					{ link : '/', label: 'home' },
					{ label: 'cart'}
				]
			});	
		}
		
		var cartFile = '';
		
		if (req.query.refresh) {
			delete cache.cart;
		}
		if (cache.cart) {
			render();
		} else {
			cache.cart = {};
			async.parallel([
				function(callback){
					kitgui.getContents({
						basePath : config.kitgui.basePath,
						host : config.kitgui.host,
						pageID : 'cart'
					}, function(kg){
						if (!kg.seo) {
							kg.seo = {};
						}
						cache.cart.kitgui = kg;
						callback();
					});
				},
				function(callback) {
					var filename = path.resolve('./views/partials/cart.html');
					fs.readFile(filename, function(err, data) {
						cache.cart.cartFile = data;
						callback();
					});
				}
			], function(err){
				render();
			});
		}
	});
	app.get('/checkout', function(req, res){
		res.render('checkout.html', {
			title : 'checkout'
		});
	});
	app.get('/contact-us', function(req, res) {
		commonFlow({ 
			req : req, res : res, 
			template : 'contactus.html', cacheKey : 'contact', pageID : 'contact-us',
			items : [
				{ id : 'contactustitle', editorType : 'inline' },
				{ id : 'contactuswording', editorType : 'inline' }
			]
		});
	});
	app.post('/contact-us', function(req, res){
		if (!req.body.email || !emailer.isEmail(req.body.email) || !req.body.message || !req.body.name) {
			res.json({ err: { msg : 'badInput' }});
			return;
		}
		emailer.send({
			to : config.email.to,
			from : config.email.from,
			subject : 'Saras Prints Website Inquiry',
			email : req.body.email,
			html : '<strong>"'+ htmlEncode(req.body.name) +'" &lt;'+ req.body.email +'&gt;</strong> wrote:<p>'+ htmlEncode(req.body.message) +'</p>'
		}, function(){
			res.json({ ok : true });
		});
	});
	app.get(/-detail$/, function(req, res) {
		
		var cacheKey = getPageID(req.path);
		
		function render() {
			res.render('product.html', cache[cacheKey]);
		}
		
		if (req.query.refresh || req.cookies.kitgui) {
			delete cache[cacheKey];
		}
		if (cache[cacheKey]) {
			render(cache[cacheKey]);
		} else {
			cache[cacheKey] = {
				year : year,
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : cacheKey,
				pageID : cacheKey
			};
			var kg;
			async.parallel([
				function(callback) {
					getJSON({port:443, host:clientid + '.hubsoft.ws',path:'/api/v1/products?productURL=' + req.path}, function(status, data) {						
						cache[cacheKey].product = data.product;
						cache[cacheKey].title = data.product.productName;
						cache[cacheKey].description = data.product.descriptions[0];
						cache[cacheKey].seo = {
							title : data.product.productName,
							description : data.product.descriptions[0]
						};
						callback();
					}, function() {
						callback();
					});
				},
				function(callback) {
					kitgui.getContents({
						basePath : config.kitgui.basePath,
						host : config.kitgui.host,
						pageID : cacheKey,
						items : [
							{ id : cacheKey + 'Title', editorType : 'inline' },
							{ id : cacheKey + 'Description', editorType : 'inline' }
						]
					}, function(kgObject){
						kg = kgObject; 
						cache[cacheKey].items = kg.items;
						callback();
					});
				}
			], function() {
				cache[cacheKey].items = kg.items;
				if (kg.items[cacheKey + 'Title'].content) {
					cache[cacheKey].title = kg.items[cacheKey + 'Title'].content;
				}
				if (kg.items[cacheKey + 'Description'].content) {
					cache[cacheKey].description = kg.items[cacheKey + 'Description'].content;
				}
				if (kg.seo.title) {
					cache[cacheKey].seo.title = kg.seo.title;
				}
				if (kg.seo.description) {
					cache[cacheKey].seo.description = kg.seo.description;
				}
				render();
			});

		}
		
	});
	app.get(/(month|year|pajamas|fuzzy-fleece|sale|spring-summer|fall-winter|holiday|new|nightgowns)/, function(req, res) {
		var cacheKey = getPageID(req.path);
		
		var tags = req.path.substr(1).split('/');
		var tagList = '';
		var ageTags = [];
		
		if (tags.length) {
			if (tags[0] === 'shop-pajamas') {
				tags.splice(0,1);
			}
			for(var i = 0; i < tags.length; i++) {
				if (filterLookup[tags[i]]) {
					ageTags.push(tags[i]);
					tags.splice(i,1);
					i--;
				}
			}
		}
		console.log(ageTags);
		tagList = tags.join(',');
		console.log(tagList);
		if (tagList === ',') { tagList = ''; }
		
		function render() {
			res.render('catalog.html', cache[cacheKey]);
		}
		
		if (req.query.refresh || req.cookies.kitgui) {
			delete cache[cacheKey];
		}
		if (cache[cacheKey]) {
			render(cache[cacheKey]);
		} else {
			cache[cacheKey] = {
				year : year,
				clientid : clientid,
				kitguiAccountKey : kitguiAccountKey,
				kitguiPageID : cacheKey,
				pageID : cacheKey,
				tags : tags
			};
			var kg;
			async.parallel([
				function(callback) {
					getJSON({port:443, host:clientid + '.hubsoft.ws',path:'/api/v1/products?tags=' + tags}, function(status, data) {
						if (data && data.products) {
							if (ageTags.length) {
								(function(){
									var ageProducts = [], arr;
									for(var i = 0; i < ageTags.length; i++) {
										arr = filterLookup[ageTags[i]];
										for(var j = 0; j < arr.length; j++) {
											for(var z = 0; z < data.products.length; z++) {
												if (data.products[z].productNumber.indexOf(arr[j]) === 0) {
													ageProducts.push(data.products[z]);
												}
											}
										}
									}
									data.products = ageProducts;
								})();								
							}
							
							cache[cacheKey].products = data.products;
						} else {
							cache[cacheKey].products = [];
						}
						
						callback();
					}, function() {
						callback();
					});
				},
				function(callback) {
					kitgui.getContents({
						basePath : config.kitgui.basePath,
						host : config.kitgui.host,
						pageID : cacheKey,
						items : [
							{ id : cacheKey + 'Slider', editorType : 'bootstrap-carousel-json' },
							{ id : cacheKey + 'H1', editorType : 'inline' },
							{ id : cacheKey + 'Description', editorType : 'inline' }
						]
					}, function(kg){
						cache[cacheKey].seo = kg.seo;
						cache[cacheKey].items = kg.items;
						callback();
					});
				}
			], function() {
				render();
			});
		}
	});
	app.get('/join-saras-club', function(req, res){
		commonFlow({ 
			req : req, res : res, 
			template : 'join-saras-club.html', cacheKey : 'join-saras-club', pageID : 'join-saras-club',
			items : [
				{ id : 'joinSarasClubDescription', editorType : 'inline' },
				{ id : 'joinSarasClubChildrenInstructions', editorType : 'inline' }
			]
		});
	});
	app.get('/sign-in', function(req, res){
		commonFlow({ 
			req : req, res : res, 
			template : 'sign-in.html', cacheKey : 'sign-in', pageID : 'sign-in',
			items : []
		});
	});
	app.get('/my-account', function(req, res){
		commonFlow({ 
			req : req, res : res, 
			template : 'my-account.html', cacheKey : 'my-account', pageID : 'my-account',
			items : []
		});
	});
	app.get('/forgot-password', function(req, res){
		commonFlow({ 
			req : req, res : res, 
			template : 'forgot-password.html', cacheKey : 'forgot-password', pageID : 'forgot-password',
			items : []
		});
	});
	app.get(/^\/(sizing|story|safe-and-comfortable|customer-service|testimonials)$/, function(req, res){
		var pageID = getPageID(req.path);
		commonFlow({ 
			req : req, res : res, 
			template : 'content.html', cacheKey : pageID, pageID : pageID,
			items : [
				{ id : pageID + 'Title', editorType : 'inline' },
				{ id : pageID + 'Html', editorType : 'html' }
			]
		});
	});
	app.get('/refresh', function(req, res){
		getJSON({port:443, host:'sarasprints.hubsoft.ws',path:'/api/v1/refresh'}, function(status, data) {
			cache = {};
			res.json({ ok : true });
		});
	});
	app.post('/join-saras-club', function(req, res){
		var data = null;
		
		try {
			data = JSON.parse(req.body.data);
		} catch(ex) {
			console.log(ex);
			res.json({
				err : {
					msg : 'oops, something went wrong'
				}
			});
			return;
		}
		
		function ifnull(obj, key, inStr) {
			if (inStr) {
				obj[key] = inStr;
			}
		}

		var merge_vars = {};
		ifnull(merge_vars, 'FNAME', data.firstName);
		ifnull(merge_vars, 'LNAME', data.lastName);
		ifnull(merge_vars, 'ADDRESS1', data.address1);
		ifnull(merge_vars, 'ADDRESS2', data.address2);
		ifnull(merge_vars, 'CITY', data.city);
		ifnull(merge_vars, 'STATE', data.state);
		ifnull(merge_vars, 'ZIP', data.zip);
		ifnull(merge_vars, 'PHONE', data.phone);
		
		var monthData = {
			January : { key : 'JAN_NAMES', names : [] },
			February : { key : 'FEB_NAMES', names : [] },
			March : { key : 'MAR_NAMES', names : [] },
			April : { key : 'APR_NAMES', names : [] },
			May : { key : 'MAY_NAMES', names : [] },
			June : { key : 'JUN_NAMES', names : [] },
			July : { key : 'JUL_NAMES', names : [] },
			August : { key : 'AUG_NAMES', names : [] },
			September : { key : 'SEP_NAMES', names : [] },
			October : { key : 'OCT_NAMES', names : [] },
			November : { key : 'NOV_NAMES', names : [] },
			December : { key : 'DEC_NAMES', names : [] },
		};
		
		if (data.children) {
			(function(){
				merge_vars.BDAY_JSON = JSON.stringify(data.children);
				var child, i, names, last;
				for(i = 0; i < data.children.length; i++) {
					child = data.children[i];
					monthData[child.month].names.push(child.name);
				}
				for(i in monthData) {
					if (monthData.hasOwnProperty(i)) {
						names = monthData[i].names;
						if (names.length === 0) {
							merge_vars[ monthData[i].key ] = 'BLANK'; 
						} else if (names.length === 1) {
							merge_vars[ monthData[i].key ] = names[0];
						} else {
							last = names.pop();
							merge_vars[ monthData[i].key ] = names.join(', ') + ' and ' + last;
						}
					}
				}
			})();
		}
		
		var mailChimpJSON = {
			id: config.mailchimp.sarasClublistID, 
			email: {
				email: data.email
			},
			merge_vars : merge_vars,
			update_existing: true
		};
		
		console.log(mailChimpJSON);
		
		mailchimp.lists.subscribe(mailChimpJSON, function(data) {
	    	res.json({ ok : true });
		}, function(error) {
	        res.json({ err : error });
		});
	});
	app.post('/subscribe',function(req, res){
		mailchimp.lists.subscribe({id: config.mailchimp.listID, email: {email:req.body.email}}, function(data) {
	    	res.json(data);
		}, function(error) {
	        res.json({ err : error });
		});
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
		res.render('500', { error: err });
	});
};

function setCache(req, cache, key) {
	if (req.query.refresh) {
		delete cache[key];
	}
	if (!cache[key]) {
		cache[key] = {};
	}
}

function getPageID(path) {
	return path.replace(/[^a-z0-9]/gi,'-').replace(/-+/gi,'-');
}