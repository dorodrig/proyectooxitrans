const https = require('https');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/jornadas/actual',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsImVtYWlsIjoiYWRtaW5Ab3hpdHJhbnMuY29tIiwiaWF0IjoxNzI3NzM0MTY5LCJleHAiOjE3Mjc4MjA1Njl9.Aw2nZw6gkFgzXPz6vbEWWHh3QxMJwNOvTyekj6dXWYI',
    'Content-Type': 'application/json'
  },
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response:', JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  
  // Intentar con HTTP
  const http = require('http');
  const httpOptions = { ...options, port: 3001 };
  delete httpOptions.rejectUnauthorized;
  
  const httpReq = http.request(httpOptions, (res) => {
    console.log(`HTTP statusCode: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('HTTP Response:', JSON.stringify(jsonData, null, 2));
      } catch (error) {
        console.log('HTTP Raw response:', data);
      }
    });
  });
  
  httpReq.on('error', (error) => {
    console.error('HTTP Error:', error.message);
  });
  
  httpReq.end();
});

req.end();