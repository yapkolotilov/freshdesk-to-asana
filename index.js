const server = require("./server");

var port = process.env.PORT;
if (port === undefined) {
    port = 80;
    console.log("Port has been reset to 80.");
}

server.start(port);