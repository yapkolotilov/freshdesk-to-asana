const requestModule = require("request");

function getRequestBody(request) {
    const ticket = request.body["freshdesk_webhook"];
    var data = {};

    // Adding fields:
    addIfPresent(ticket["ticket_subject"], "name", data);
    data["name"] += " [Webhook]";

    // html_notes:
    if (checkPresent(ticket["ticket_description"])) {
        html_notes = parseHtml(ticket["ticket_description"]);
        html_notes += "<b>--- Дополнительная информация ---</b>";
        if (checkPresent(ticket["ticket_url"]))
            html_notes += "\n<b>URL</b>: " + `<a href="${ticket["ticket_url"]}"></a>`;
        if (checkPresent(ticket["ticket_ticket_type"]))
            html_notes += "\n<b>Тип заявки: </b>" + ticket["ticket_ticket_type"];
        if (checkPresent(ticket["ticket_priority"]))
            html_notes += "\n<b>Приоритет: </b>" + parsePriority(ticket["ticket_priority"]);
        if (checkPresent(ticket["ticket_status"]))
            html_notes += "\n<b>Статус: </b>" + parseStatus(ticket["ticket_status"]);

        if (checkPresent(ticket["ticket_company_name"]))
            html_notes += "\n<b>Компания</b>: " + ticket["ticket_company_name"];
        if (checkPresent(ticket["ticket_group_name"]))
            html_notes += "\n<b>Группа</b>: " + ticket["ticket_group_name"];
        if (checkPresent(ticket["ticket_agent_name"]))
            html_notes += "\n<b>Агент</b>: " + ticket["ticket_agent_name"];
        if (checkPresent(ticket["ticket_agent_email"]))
            html_notes += "\n<b>e-mail Агента</b>: " + ticket["ticket_agent_email"];
        html_notes += "</body>";
        data["html_notes"] = html_notes;
    }

    // Date:
    if (checkPresent(ticket["ticket_due_by_time"]))
        data["due_on"] = parseDate(ticket["ticket_due_by_time"]);

    // Tags:
    // data["tags"] = [1130094219064544];
    if (checkPresent(ticket["ticket_tags"]) && ticket["ticket_tags"] !== "[]")
        parseTags(request, data);

    var result = {};
    result["data"] = data;
    return result;
}

function parsePriority(priority) {
    switch (priority) {
        case "Low":
            return "Низкий";
        case "Medium":
            return "Средний";
        case "High":
            return "Высокий";
        case "Urgent":
            return "Срочно";
        default:
            return priority;
    }
}

function parseStatus(status) {
    switch (status) {
        case "Open":
            return "Открыто";
        case "Pending":
            return "В ожидании";
        case "Resolved":
            return "Решено";
        case "Closed":
            return "Закрыто";
        default:
            return status;
    }
}

function parseTags(request, data) {
    data["tags"] = [];
    const username = request.query["username"];
    const password = request.query["password"];
    const workspace = request.query["workspace"];
    if (workspace === undefined)
        return;

    const url = "https://app.asana.com/api/1.0/workspaces/" + workspace + "/tags";
    const auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    var tags = request.body["freshdesk_webhook"]["ticket_tags"].split(", ");
    for (var tag of tags) {
        requestModule.post(url,
            {
                headers: {
                    Authorization: auth
                },
                json: {data: {name: tag, /*color: "dark-green"*/}}
            },
            function (error, response) {
                if (error) {
                    console.log("Tag error!");
                    console.log(response.body);
                } else {
                    console.log(response.body);
                    if (response.body["data"]["id"] !== undefined)
                        data["tags"].push(response.body["data"]["id"]);
                }
            }
            )
    }
}

function parseDate(date) {
    var words = date.split(" ");
    words = words.filter(word => word != null && word !== "");

    var result = words[2];

    // month:
    var month = -1;
    switch (words[0]) {
        case "January":
            month = 1;
            break;
        case "February":
            month = 2;
            break;
        case "March":
            month = 3;
            break;
        case "April":
            month = 4;
            break;
        case "May":
            month = 5;
            break;
        case "June":
            month = 6;
            break;
        case "July":
            month = 7;
            break;
        case "August":
            month = 8;
            break;
        case "September":
            month = 9;
            break;
        case "October":
            month = 10;
            break;
        case "November":
            month = 11;
            break;
        case "December":
            month = 12;
            break;
    }
    result += "-";
    result += month < 10 ? "0" : "";
    result += month;
    // day:
    result += "-";
    result += words[1] < 10 ? "0" : "";
    result += words[1];

    return result;
}

function parseHtml(ticket_description) {
    var html_notes = "<body>" + ticket_description;
    html_notes = html_notes.replace(/style="[^"]*"/g, "");
    html_notes = html_notes.replace(/\n/g, "");
    html_notes = html_notes.replace(/<\/div>/g, "\n");
    html_notes = html_notes.replace(/<div[^>]*>/g, "");
    html_notes = html_notes.replace(/<\/span>/g, "");
    html_notes = html_notes.replace(/<span[^>]*>/g, "");
    html_notes = html_notes.replace(/rel="[^"]*"/g, "");
    html_notes = html_notes.replace(/dir="[^"]*"/g, "");
    html_notes = html_notes.replace(/ >/g, ">");
    html_notes = html_notes.replace(/<img[^>]*>/g, "");
    html_notes = html_notes.replace(/<br>/g, "");
    html_notes = html_notes.replace(/\s*target\s*/g, "");

    return html_notes;
}

function checkPresent(value) {
    return value !== undefined && value !== null;
}

function addIfPresent(value, name, data) {
    if (checkPresent(value))
        data[name] = value;
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

exports.getRequestBody = getRequestBody;