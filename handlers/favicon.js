const fs = require("fs");

function favicon (request, response) {
    response.setHeader("Content-Type", "image/x-icon");
    response.writeHead(200);
    var readStream = fs.createReadStream("files/favicon.ico");
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(response);
}

exports.favicon = favicon;