var async = require('async'),
	config = require('config');

module.exports = (function(){
	var cache = {};
	
	function getItem(item, callback) {
		if (typeof cache[item.id] !== 'undefined') {
			return item.id;
		}
		var reqOptions = {
			host: 's3.amazonaws.com', 
			port:80,
			path: '/kitgui/clients/' + config.kitgui.accountKey +  '/'+ item.kind +'/' + item.id + '.txt'
		};
		getText(reqOptions, function(res){
			if (res.statusCode === 200) {
				callback({id: item.id, content: res});
			}
		}, function(){
			
		});
	}
	
	function getItems(options, callback) {
		
		var i = 0, req = options.req;
		
		if (req.cookies.kitgui) {
			for(; i < options.items.length; i++) {
				if (cache[options.items[i].id] && i > -1) {
				    delete cache[options.items[i].id];
				}
			}
		}
		
		async.map(options.items, getItem, function(err, results) {
			var i = 0, obj = {};
			if (err) {
				// what to do?
			}
			for(; i < results.length; i++) {
				obj[results[i].id] = results[i].content;
			}
			return obj;
		});
	}

	return {
		getContents : 
	};
})();

function getText(options, onResult, onError) {

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res) {
        var output = [];
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output.push(chunk);
        });

        res.on('end', function() {
            var obj = output.join('');
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
		onError(err);
    });

    req.end();
};