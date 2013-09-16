var getJSON = require('../lib/getJSON.js').getJSON;

module.exports.set = function(app) {
	var year = (new Date()).getFullYear();
	app.get('/', function(req, res){
		res.render('index', {
			year : year,
			title : "Sara's Prints"
		});
	});
	app.get('/contactus', function(req, res){
		res.render('contactus', {
			year : year,
			title : "Contact Us"
		});
	});
	app.get(/^\/(pjs-for-girls|pjs-for-boys|fuzzy-fleece|sale|up-past-8)$/, function(req, res) {
		getJSON({port:443, host:'klim.hubsoft.ws',path:'/api/v1/products'}, function(status, data) {
			if (status === 200) {
				res.render('catalog', {
					year : year,
					title : "Catalog",
					products : data.products
				});
			} else {
				res.redirect('/500');
			}
		});
	});
	app.get(/^\/(team|story|sizing-chart|site-map)$/, function(req, res) {
		
		// get data from kitgui...
		/*
		kitgui.get([
			{id:'title',type:'inline'},
			{id:'body',type:'html'}
		], function(){
			res.render('content', {
				year : year,
				title : title,
				body : body
			});
		});
		*/
		
		res.render('content', {
			year : year,
			title : "template page",
			html : ""
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