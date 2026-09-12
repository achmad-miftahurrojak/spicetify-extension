const http = require('http');
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    console.log("RECEIVED_PAYLOAD:");
    console.log(body);
    res.end('ok');
    process.exit(0);
  });
});
server.listen(9999, () => console.log('Listening on 9999...'));
