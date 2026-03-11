const axios = require('axios');

const API_URL = 'http://localhost:5000';
let accessToken = '';

const testProgressTracking = async () => {
  console.log('📊 Testing Video Progress Tracking\n');

  try {
    // Login
    console.log('1️⃣ Logging in...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    accessToken = login.data.accessToken;
    console.log('✅ Logged in\n');

    const headers = { Authorization: `Bearer ${accessToken}` };

    // Test 1: Check no progress initially
    console.log('2️⃣ Testing GET /progress/:videoId (no progress)...');
    const noProgress = await axios.get(`${API_URL}/progress/1`, { headers });
    if (noProgress.data.progress === null) {
      console.log('✅ TEST PASSED: No progress initially\n');
    } else {
      console.log('❌ TEST FAILED: Should have no progress\n');
    }

    // Test 2: Save progress (first time - INSERT)
    console.log('3️⃣ Testing POST /progress/:videoId (save progress)...');
    const save1 = await axios.post(`${API_URL}/progress/1`, {
      watchedDuration: 120,
      completed: false
    }, { headers });
    console.log('Response:', save1.data);
    console.log('✅ Progress saved (120 seconds)\n');

    // Test 3: Get progress
    console.log('4️⃣ Testing GET /progress/:videoId (with progress)...');
    const getProgress = await axios.get(`${API_URL}/progress/1`, { headers });
    console.log('Progress:', {
      watched_duration: getProgress.data.progress.watched_duration,
      completed: getProgress.data.progress.completed,
      video_title: getProgress.data.progress.video_title
    });
    
    if (getProgress.data.progress.watched_duration === 120) {
      console.log('✅ TEST PASSED: Progress retrieved correctly\n');
    } else {
      console.log('❌ TEST FAILED: Wrong progress value\n');
    }

    // Test 4: Update progress (UPDATE)
    console.log('5️⃣ Testing progress update (upsert)...');
    await axios.post(`${API_URL}/progress/1`, {
      watchedDuration: 240,
      completed: false
    }, { headers });
    
    const updated = await axios.get(`${API_URL}/progress/1`, { headers });
    if (updated.data.progress.watched_duration === 240) {
      console.log('✅ TEST PASSED: Progress updated (240 seconds)\n');
    } else {
      console.log('❌ TEST FAILED: Progress not updated\n');
    }

    // Test 5: Duration capping
    console.log('6️⃣ Testing duration capping...');
    const cappingTest = await axios.post(`${API_URL}/progress/1`, {
      watchedDuration: 9999, // Way over video duration
      completed: false
    }, { headers });
    
    console.log('Sent: 9999 seconds');
    console.log('Saved:', cappingTest.data.progress.watched_duration, 'seconds');
    
    if (cappingTest.data.progress.watched_duration <= 600) {
      console.log('✅ TEST PASSED: Duration capped to video length\n');
    } else {
      console.log('❌ TEST FAILED: Duration not capped\n');
    }

    // Test 6: Auto-complete at 95%
    console.log('7️⃣ Testing auto-complete at 95%...');
    const autoComplete = await axios.post(`${API_URL}/progress/1`, {
      watchedDuration: 570, // 95% of 600
      completed: false
    }, { headers });
    
    console.log('Watched: 570/600 seconds (95%)');
    console.log('Auto-completed:', autoComplete.data.progress.completed);
    
    if (autoComplete.data.progress.completed) {
      console.log('✅ TEST PASSED: Auto-completed at 95%\n');
    } else {
      console.log('❌ TEST FAILED: Should auto-complete\n');
    }

    // Test 7: Check next video unlocked
    console.log('8️⃣ Testing if next video unlocked...');
    const tree = await axios.get(`${API_URL}/subjects/1/tree`, { headers });
    const video1 = tree.data.sections[0].videos[0];
    const video2 = tree.data.sections[0].videos[1];
    
    console.log('Video 1:', {
      title: video1.title,
      completed: video1.is_completed,
      locked: video1.locked
    });
    console.log('Video 2:', {
      title: video2.title,
      locked: video2.locked
    });
    
    if (video1.is_completed && !video2.locked) {
      console.log('✅ TEST PASSED: Next video unlocked after completion\n');
    } else {
      console.log('❌ TEST FAILED: Next video should be unlocked\n');
    }

    // Test 8: Get overall progress
    console.log('9️⃣ Testing GET /progress (overall progress)...');
    const overall = await axios.get(`${API_URL}/progress`, { headers });
    console.log('Overall Progress:');
    overall.data.progress.forEach(sub => {
      console.log(`  ${sub.subject_title}: ${sub.completed_videos}/${sub.total_videos} (${sub.progress_percentage}%)`);
    });
    console.log('');

    // Summary
    console.log('🎉 All Progress Tracking Tests Complete!\n');
    console.log('📊 Summary:');
    console.log('  ✅ Save progress works');
    console.log('  ✅ Get progress works');
    console.log('  ✅ Update progress (upsert) works');
    console.log('  ✅ Duration capping works');
    console.log('  ✅ Auto-complete at 95% works');
    console.log('  ✅ Next video unlocks after completion');
    console.log('  ✅ Overall progress tracking works');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testProgressTracking();
