var	https = require('https'),
	express = require('express'),
	config = require('config'),
	app = express(),
	middleware = require('./controllers/middleware.js'),
	controllers = require('./controllers'),
	http = require('http'),
	fs = require('fs'),
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
	},
	winston = require('winston'),
	domain = require('domain'),
	d = domain.create();
	
nunjucks.set(app);

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
middleware.set(context);
app.use(app.router);
controllers.set(context);

d.on('error', function(err){
	winston.log('error',err);
	winston.log('info','closing down server at ' + (new Date()).toString() + '\r\n\r\n');
	process.exit(1);
});

d.run(function(){
	
	winston.add(winston.transports.File, { filename: 'winston.log' });
	winston.remove(winston.transports.Console);
	
	winston.log('info','starting server at ' + (new Date()).toString() + '\r\n');
	
	http.createServer(app).listen(process.env.PORT || 4000);
	https.createServer({
		key : fs.readFileSync('./www_sarasprints_com.key').toString(),
		cert : fs.readFileSync('./SARASPRINTS.COM.crt').toString(),
		ca : fs.readFileSync('./NetworkSolutions_CA.crt').toString(),
		passphrase : config.SSL.passphrase
	},app).listen(process.env.SecurePORT || 4001);

	console.log('HTTP on port ' + (process.env.PORT || 4000));
	console.log('HTTPS on port ' + (process.env.SecurePORT || 4001));	
});