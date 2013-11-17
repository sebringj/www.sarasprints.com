var http = require("http"),
	https = require("https");

exports.getJSON = function(options, onResult, onError) {

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res) {
        var output = [];
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output.push(chunk);
        });

        res.on('end', function() {
            var obj = null;
			try {
				obj = JSON.parse(output.join(''));
			} catch(e) {}
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
		if (onError) {
			onError(err);
		}
    });

    req.end();
};