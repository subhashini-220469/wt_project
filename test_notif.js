const http = require('http');

const data = JSON.stringify({
  user_email: "david@example.com",
  message: "Test Notification: Please review application.",
  type: "new_job",
  link: "/app"
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/notifications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
