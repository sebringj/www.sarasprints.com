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
            var obj = JSON.parse(output.join(''));
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
		onError(err);
    });

    req.end();
};