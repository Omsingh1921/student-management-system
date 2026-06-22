// Quick test script to verify login API works
// Run: node test-login.js

const payload = {
  email: 'john@student.com',
  password: '123456'
};

fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:5174'
  },
  body: JSON.stringify(payload)
})
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers));
    return res.json();
  })
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.token) {
      console.log('\n✅ Backend is working! Token generated.');
      console.log('Token:', data.token.substring(0, 50) + '...');
    }
  })
  .catch(err => {
    console.error('❌ Request failed:', err.message);
  });
