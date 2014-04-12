var express = require('express'),
	config = require('config'),
	app = express(),
	server = app.listen(process.env.PORT || 4000),
	middleware = require('./controllers/middleware.js'),
	controllers = require('./controllers'),
	http = require('http'),
	path = require('path'),
	cons = require('consolidate'),
	nunjucks = require('./lib/nunjucks.js'),
	cache = {},
	mcapi = require('mailchimp-api'),
	getJSON = require('./lib/getJSON').getJSON,
	context = {
		app : app,
		cache : cache,
		mailchimp : (new mcapi.Mailchimp(config.mailchimp.apikey))
	};
	
nunjucks.set(app);

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
middleware.set(context);
app.use(app.router);
controllers.set(context);
console.log('running on port ' + (process.env.PORT || 4000));

setInterval(function(){
	try {
		getJSON({port:443, host:'sarasprints.jit.su',path:'/refresh'}, function(status, data) {
			
		});
	} catch(ex) { }
}, (1000 * 60 * 60 * 4));