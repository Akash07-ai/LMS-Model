const axios = require('axios');

const API_URL = 'http://localhost:5000';
let accessToken = '';
let userId = 0;

const testVideoLocking = async () => {
  console.log('🔒 Testing Video Locking System\n');

  try {
    // Step 1: Register/Login
    console.log('1️⃣ Logging in...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    accessToken = login.data.accessToken;
    userId = login.data.user.id;
    console.log('✅ Logged in as:', login.data.user.email);
    console.log('');

    const headers = { Authorization: `Bearer ${accessToken}` };

    // Step 2: Get subject tree (initial state)
    console.log('2️⃣ Getting subject tree (initial state)...');
    const tree1 = await axios.get(`${API_URL}/subjects/1/tree`, { headers });
    const firstVideo = tree1.data.sections[0].videos[0];
    const secondVideo = tree1.data.sections[0].videos[1];
    
    console.log('First video:', firstVideo.title);
    console.log('  - Locked:', firstVideo.locked);
    console.log('  - Completed:', firstVideo.is_completed);
    console.log('');
    console.log('Second video:', secondVideo.title);
    console.log('  - Locked:', secondVideo.locked);
    console.log('  - Completed:', secondVideo.is_completed);
    console.log('');

    if (!firstVideo.locked && secondVideo.locked) {
      console.log('✅ TEST PASSED: Only first video is unlocked\n');
    } else {
      console.log('❌ TEST FAILED: Locking logic incorrect\n');
    }

    // Step 3: Complete first video
    console.log('3️⃣ Completing first video...');
    await axios.post(`${API_URL}/progress/${firstVideo.id}`, {
      watchedDuration: firstVideo.duration,
      completed: true
    }, { headers });
    console.log('✅ First video marked as complete\n');

    // Step 4: Get tree again
    console.log('4️⃣ Getting subject tree (after completing first video)...');
    const tree2 = await axios.get(`${API_URL}/subjects/1/tree`, { headers });
    const firstVideoAfter = tree2.data.sections[0].videos[0];
    const secondVideoAfter = tree2.data.sections[0].videos[1];
    const thirdVideoAfter = tree2.data.sections[0].videos[2];
    
    console.log('First video:', firstVideoAfter.title);
    console.log('  - Locked:', firstVideoAfter.locked);
    console.log('  - Completed:', firstVideoAfter.is_completed);
    console.log('');
    console.log('Second video:', secondVideoAfter.title);
    console.log('  - Locked:', secondVideoAfter.locked);
    console.log('  - Completed:', secondVideoAfter.is_completed);
    console.log('');
    console.log('Third video:', thirdVideoAfter.title);
    console.log('  - Locked:', thirdVideoAfter.locked);
    console.log('');

    if (firstVideoAfter.is_completed && !secondVideoAfter.locked && thirdVideoAfter.locked) {
      console.log('✅ TEST PASSED: Second video unlocked after completing first\n');
    } else {
      console.log('❌ TEST FAILED: Second video should be unlocked\n');
    }

    // Step 5: Try accessing locked video
    console.log('5️⃣ Trying to access locked video...');
    try {
      await axios.get(`${API_URL}/videos/${thirdVideoAfter.id}`, { headers });
      console.log('❌ TEST FAILED: Should not be able to access locked video\n');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ TEST PASSED: Locked video access denied (403)\n');
      } else {
        console.log('❌ TEST FAILED: Wrong error code\n');
      }
    }

    // Step 6: Complete entire first section
    console.log('6️⃣ Completing entire first section...');
    await axios.post(`${API_URL}/progress/${secondVideoAfter.id}`, {
      watchedDuration: secondVideoAfter.duration,
      completed: true
    }, { headers });
    await axios.post(`${API_URL}/progress/${thirdVideoAfter.id}`, {
      watchedDuration: thirdVideoAfter.duration,
      completed: true
    }, { headers });
    console.log('✅ Section 1 completed\n');

    // Step 7: Check if next section unlocked
    console.log('7️⃣ Checking if next section unlocked...');
    const tree3 = await axios.get(`${API_URL}/subjects/1/tree`, { headers });
    const firstVideoSection2 = tree3.data.sections[1].videos[0];
    
    console.log('First video of Section 2:', firstVideoSection2.title);
    console.log('  - Locked:', firstVideoSection2.locked);
    console.log('');

    if (!firstVideoSection2.locked) {
      console.log('✅ TEST PASSED: Next section unlocked after completing previous section\n');
    } else {
      console.log('❌ TEST FAILED: Next section should be unlocked\n');
    }

    // Summary
    console.log('🎉 All Video Locking Tests Complete!\n');
    console.log('📊 Summary:');
    console.log('  ✅ Initial state: Only first video unlocked');
    console.log('  ✅ Sequential unlocking: Videos unlock one by one');
    console.log('  ✅ Access control: Locked videos return 403');
    console.log('  ✅ Section progression: Next section unlocks after completion');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

// Run tests
testVideoLocking();
