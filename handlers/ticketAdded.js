const requestModule = require("request");
const getRequestBody = require("./getRequestBody");

function ticketAdded(request, response) {
    console.log("Got webhook");
    if (request.query["username"] === undefined || request.query["password"] === undefined) {
        response.writeHead(400);
        response.write("Error! username and password should be specified!");
        response.end();
        return;
    }
    if (request.query["project"] === undefined && request.query["workspace"] === undefined) {
        response.writeHead(400);
        response.write("Error! projects and workspace (optional) should be specified!");
        response.end();
        return;
    }

    const username = request.query["username"];
    const password = request.query["password"];
    const url = "https://app.asana.com/api/1.0/tasks?projects=" + request.query["project"];
    const auth = "Basic " + new Buffer(username + ":" + password).toString("base64");


    // Pass fields:
    var body = getRequestBody.getRequestBody(request);

    var delay = (checkPresent(request.query["workspace"]) &&
        request.body["freshdesk_webhook"]["ticket_tags"] !== "") ? 3000 : 0;

    // Create ticket:
    setTimeout(() => requestModule.post(url, {
            headers: {
                "Authorization": auth
            },
            json: body
        },
        function (error, resp) {
            if (error) {
                console.log("Error");
            }
            console.log(resp.body);
        }
    ), delay);

    response.end();
}

function checkPresent(value) {
    return value !== undefined && value !== null;
}

exports.ticketAdded = ticketAdded;
//localhost/ticketAdded?username=0/b9104ccc8c1cfe68502ab55a225794bc&password=x&project=1129401981866549