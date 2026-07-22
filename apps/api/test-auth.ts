import http from 'http';

function signup(email: string, password: string, name: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password, name });
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/sign-up',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve({ raw: body, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function health(): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 3001, path: '/health', method: 'GET' }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Testing health...');
  const h = await health();
  console.log('Health:', h);

  console.log('\nTesting signup...');
  const result = await signup('test@example.com', 'password123', 'Test User');
  console.log('Signup result:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
