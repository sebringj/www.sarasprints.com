var async = require('async'),
	http = require('http');
	
function getCacheKey(item) {
	return item.kind + '-' + item.id;
}

module.exports = (function(){	
	function getItems(options, callback) {
		
		var i = 0, req = options.req, cacheKey,
			cache = options.cache,
			items = [];
			
		if (!cache) {
			cache = [];
		}
		
		if (req.cookie && req.cookie.kitgui) {
			for(; i < options.items.length; i++) {
				cacheKey = getCacheKey(options.items[i]);
				if (cache[cacheKey] && i > -1) {
				    delete cache[cacheKey];
				}
			}
		}
		
		async.forEach(options.items, function(item, callback) {
			var cacheKey = getCacheKey(item);

			if (typeof cache[cacheKey] !== 'undefined') {
				items.push(cache[cacheKey]);
				callback();
				return;
			}
			
			var reqOptions = {
				host: options.host, 
				port:80,
				path: options.basePath +  '/' + item.kind +'/' + item.id + '.txt'
			};
			
			getText(reqOptions, function(statusCode, content){
				var theItem;
				if (statusCode === 200) {
					theItem = {
						id: item.id, 
						kind: item.kind, 
						content: content, 
						editorType : item.editorType
					};
					cache[cacheKey] = theItem;
					items.push(theItem);
					callback();
				} else {
					callback();
				}
			}, function(){
				callback();
			});
		}, function(err) {
			callback(items);
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