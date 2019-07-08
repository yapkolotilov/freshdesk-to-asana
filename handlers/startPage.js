const fs = require("fs");

function startPage (request, response) {
    response.writeHead(200);
    var readStream = fs.createReadStream("files/homePage.html");
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(response);
}

exports.startPage = startPage;