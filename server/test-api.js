const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('Testing API endpoints...\n');
  
  // Test health endpoint
  try {
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ Health check:', healthResponse);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test send OTP endpoint
  try {
    const otpResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/send-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      email: 'test@example.com',
      purpose: 'signin'
    });
    console.log('✅ Send OTP:', otpResponse);
  } catch (error) {
    console.log('❌ Send OTP failed:', error.message);
  }
  
  // Test signin endpoint (just email)
  try {
    const signinResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/signin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      email: 'test@example.com'
    });
    console.log('✅ Signin (email only):', signinResponse);
  } catch (error) {
    console.log('❌ Signin failed:', error.message);
  }
}

testAPI(); 