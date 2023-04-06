const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 3333;

const server = http.createServer((req, res) => {
  const endpoint = req.url.slice(1); // Remove leading slash
  const filePath = path.join(__dirname, "response", `${endpoint}.json`);

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      res.writeHead(404, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ error: "Not found" }));
    } else {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(data);
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
