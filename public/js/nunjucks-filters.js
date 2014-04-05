(function(){
	var filters = [
		{
			name : 'stringify',
			func : function(str) {
				if (str) {
					return JSON.stringify(str);
				}
			    return '';
			},
			async : false
		},
		{
			name : 'cur',
			func : function(num){
				if (typeof num !== 'number') { return '$0.00'; }
				return '$' + num.toFixed(2);
			},
			async : false
		}
	];
	if (typeof exports === 'undefined') {
		var env = new nunjucks.Environment();
		for(var i = 0; i < filters.length; i++) {
			env.addFilter(filters[i].name, filters[i].func, filters[i].async);
		}
		this.sarasprints = this.sarasprints || {};
		sarasprints.nunjucks = env;
	} else {
		module.exports = filters;
	}

})();