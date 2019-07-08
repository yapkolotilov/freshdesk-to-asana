const express = require("express");
const startPage = require("./handlers/startPage");
const ticketAdded = require("./handlers/ticketAdded");
const favicon = require("./handlers/favicon");

function start(port) {
    const app = express();
    app.use(express.json());

    // Subscribe handlers:
    // Start page:
    app.get("/", startPage.startPage);
    // Images:
    app.get("/favicon.ico", favicon.favicon);
    // Webhook:
    app.post("/ticket", ticketAdded.ticketAdded);

    // Start server:
    app.listen(port);
    console.log("Server has started");
}

exports.start = start;