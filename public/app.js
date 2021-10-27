const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));


app.get("/", (req, res) => {
  res.status(200).send();
});

// app.listen(port, () => {
//   console.log(`Listening to requests on http://localhost:${port}`);
// });

app.use('/', function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});





const server = http.createServer(app);
const port = 3000;
server.listen(port);

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });