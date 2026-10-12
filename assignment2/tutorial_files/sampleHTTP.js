// const http = require("http");

// const server = http.createServer((req, res) => {
//     if (req.method == "GET" && req.url === "/time") {
//         res.writeHead(200, {"Content-Type": "application/json"});

//         res.end(
//             JSON.stringify({
//                 time: new Date().toString(),
//             }),
//         );
//         return;
//     }

//     res.writeHead(404, {"Content-Type": "application/json"});

//     res.end(
//         JSON.stringify({
//             message: "That route is not available.",
//         }),
//     );
// });

// server.listen(8000);

// implement if statement, for successful and unsuccessful scenario
// Want to access website, so use GET
// url is customized with localhost:8000 + /.... , where /.... comes from req.url
// res.writeHead accepts authorization/error code and content type
// res.end accepts stringify statement to display text on url
// time, message, etc can be anything since all the text will be stringify onto the HTML page. Its not a default route variable or declared variable in general


// -------------------------------------------------------
// Additional Features
// so GET gets the url, then add info with stringify. data is SAVED, so don't send sensitive info
// POST - data is not saved, so its a bit more safer but still be careful

// Version 2 -------------------------

const http = require("http");

const htmlString = `
<!DOCTYPE html>
<html>
<body>
<h1>Clock</h1>
<button id="getTimeBtn">Get the Time</button>
<p id="time"></p>
<script>
document.getElementById('getTimeBtn').addEventListener('click', async () => {
  const res = await fetch('/time');
  const timeObj = await res.json();
  console.log(timeObj);
  const timeP = document.getElementById('time');
  timeP.textContent = timeObj.time;
});
</script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/time") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        time: new Date().toString(),
      }),
    );
  } else if (req.method === "GET" && req.url === "/timePage") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(htmlString);
  } else if (req.method === "POST" && req.url === "/echo") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    // convert from string to JSON back to string

    req.on("end", () => {
      const parsedBody = JSON.parse(body);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          weReceived: parsedBody,
        }),
      );
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "That route is not available.",
      }),
    );
  }
});

server.listen(8000);