var async = require('async'),
	config = require('config');
	
function getCacheKey(item) {
	return item.kind + '-' + item.id;
}

module.exports = (function(){	
	function getItem(item, callback) {
		var cacheKey = getCacheKey(item);
		
		if (typeof this.cache[cacheKey] !== 'undefined') {
			return this.cache[cacheKey];
		}
		var reqOptions = {
			host: 's3.amazonaws.com', 
			port:80,
			path: '/kitgui/clients/' + config.kitgui.accountKey +  '/'+ item.kind +'/' + item.id + '.txt'
		};
		getText(reqOptions, function(res){
			if (res.statusCode === 200) {
				callback({id: item.id, kind: item.kind, content: res});
			}
		}, function(){
			
		});
	}
	
	function getItems(options, callback) {
		
		var i = 0, req = options.req, cacheKey;
		
		if (req.cookies.kitgui) {
			for(; i < options.items.length; i++) {
				cacheKey = getCacheKey(options.items[i]);
				if (this.cache[cacheKey] && i > -1) {
				    delete this.cache[cacheKey];
				}
			}
		}
		
		async.map(options.items, getItem, function(err, results) {
			var i = 0, obj = {};
			if (err) {
				// what to do?
			}
			for(; i < results.length; i++) {
				cacheKey = getCacheKey(results[i]);
				obj[results[i].id] = results[i].content;
			}
			return obj;
		});
	}

	return {
		getContents : getItems
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