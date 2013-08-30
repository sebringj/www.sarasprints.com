var express = require('express'),
	config = require('config'),
	app = express(),
	server = app.listen(process.env.PORT || 3000),
	controllers = require('./controllers'),
	http = require('http'),
	path = require('path'),
	cons = require('consolidate'),
	swig = require('swig');

app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.set('view cache', false);
app.set('views', __dirname + '/views');
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));

controllers.set(app);