module.exports.set = function(app) {
	var year = (new Date()).getFullYear();
	app.get('/', function(req, res){
		res.render('index', {
			year : year,
			title : "Sara's Prints"
		});
	});
};