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

http.createServer(app).listen(process.env.PORT || 4000);
https.createServer({
	key : fs.readFileSync('./www_sarasprints_com.key').toString(),
	cert : fs.readFileSync('./SARASPRINTS.COM.crt').toString(),
	ca : fs.readFileSync('./NetworkSolutions_CA.crt').toString(),
	passphrase : 'Abc123!~!'
},app).listen(process.env.SecurePORT || 4001);

console.log('HTTP on port ' + (process.env.PORT || 4000));
console.log('HTTPS on port ' + (process.env.SecurePORT || 4001));

setInterval(function(){
	try {
		getJSON({port:443, host:'sarasprints.jit.su',path:'/refresh'}, function(status, data) {
			
		});
	} catch(ex) { }
}, (1000 * 60 * 60 * 4));