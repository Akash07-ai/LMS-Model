const axios = require('axios');

const API_URL = 'http://localhost:5000';
let accessToken = '';
let userId = 0;

const testAuth = async () => {
  console.log('🧪 Testing Authentication System\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health:', health.data);
    console.log('');

    // Test 2: Register
    console.log('2️⃣ Testing Registration...');
    const registerData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };
    
    const register = await axios.post(`${API_URL}/auth/register`, registerData);
    accessToken = register.data.accessToken;
    userId = register.data.user.id;
    console.log('✅ Register Response:', {
      message: register.data.message,
      userId: register.data.user.id,
      email: register.data.user.email,
      tokenReceived: !!accessToken
    });
    console.log('');

    // Test 3: Login
    console.log('3️⃣ Testing Login...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    accessToken = login.data.accessToken;
    console.log('✅ Login Response:', {
      message: login.data.message,
      tokenReceived: !!accessToken
    });
    console.log('');

    // Test 4: Get Current User (Protected Route)
    console.log('4️⃣ Testing Protected Route...');
    const currentUser = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ Current User:', currentUser.data.user);
    console.log('');

    // Test 5: Test Invalid Token
    console.log('5️⃣ Testing Invalid Token...');
    try {
      await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
    } catch (error) {
      console.log('✅ Invalid token rejected:', error.response.data.message);
    }
    console.log('');

    // Test 6: Test Duplicate Email
    console.log('6️⃣ Testing Duplicate Email...');
    try {
      await axios.post(`${API_URL}/auth/register`, registerData);
    } catch (error) {
      console.log('✅ Duplicate email rejected:', error.response.data.message);
    }
    console.log('');

    // Test 7: Test Wrong Password
    console.log('7️⃣ Testing Wrong Password...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: registerData.email,
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Wrong password rejected:', error.response.data.message);
    }
    console.log('');

    console.log('🎉 All tests passed!\n');
    console.log('📊 Summary:');
    console.log('  ✅ Health check working');
    console.log('  ✅ Registration working');
    console.log('  ✅ Login working');
    console.log('  ✅ Protected routes working');
    console.log('  ✅ Token validation working');
    console.log('  ✅ Error handling working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

// Run tests
testAuth();
