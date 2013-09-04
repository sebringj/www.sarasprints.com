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
			title : "template page"
		});
	});
};