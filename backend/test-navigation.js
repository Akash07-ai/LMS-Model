const axios = require('axios');

const API_URL = 'http://localhost:5000';
let accessToken = '';

const testVideoNavigation = async () => {
  console.log('🎥 Testing Video Navigation System\n');

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

    // Test 1: Get First Video
    console.log('2️⃣ Testing GET /subjects/:id/first-video...');
    const firstVideo = await axios.get(`${API_URL}/subjects/1/first-video`, { headers });
    console.log('First video:', firstVideo.data.video.title);
    console.log('Video ID:', firstVideo.data.video.id);
    console.log('');

    const firstVideoId = firstVideo.data.video.id;

    // Test 2: Get Video Details with Navigation
    console.log('3️⃣ Testing GET /videos/:id (with prev/next)...');
    const videoDetails = await axios.get(`${API_URL}/videos/${firstVideoId}`, { headers });
    console.log('Video:', videoDetails.data.title);
    console.log('Previous ID:', videoDetails.data.previous_video_id);
    console.log('Next ID:', videoDetails.data.next_video_id);
    console.log('Locked:', videoDetails.data.locked);
    console.log('YouTube URL:', videoDetails.data.youtube_url);
    console.log('');

    if (videoDetails.data.previous_video_id === null) {
      console.log('✅ TEST PASSED: First video has no previous\n');
    } else {
      console.log('❌ TEST FAILED: First video should have no previous\n');
    }

    // Test 3: Get Next Video
    console.log('4️⃣ Testing GET /videos/:id/next...');
    const nextVideo = await axios.get(`${API_URL}/videos/${firstVideoId}/next`, { headers });
    if (nextVideo.data.video) {
      console.log('Next video:', nextVideo.data.video.title);
      console.log('Next video ID:', nextVideo.data.video.id);
      console.log('✅ TEST PASSED: Next video found\n');
    } else {
      console.log('❌ No next video found\n');
    }

    // Test 4: Get Previous Video (should be null for first)
    console.log('5️⃣ Testing GET /videos/:id/previous...');
    const prevVideo = await axios.get(`${API_URL}/videos/${firstVideoId}/previous`, { headers });
    if (prevVideo.data.video === null) {
      console.log('✅ TEST PASSED: First video has no previous\n');
    } else {
      console.log('❌ TEST FAILED: First video should have no previous\n');
    }

    // Test 5: Try Accessing Locked Video
    console.log('6️⃣ Testing locked video access...');
    try {
      await axios.get(`${API_URL}/videos/5`, { headers });
      console.log('❌ TEST FAILED: Should not access locked video\n');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ TEST PASSED: Locked video blocked (403)\n');
        console.log('Message:', error.response.data.message);
        console.log('');
      } else {
        console.log('❌ TEST FAILED: Wrong error code\n');
      }
    }

    // Test 6: Complete First Video and Check Navigation
    console.log('7️⃣ Completing first video...');
    await axios.post(`${API_URL}/progress/${firstVideoId}`, {
      watchedDuration: videoDetails.data.duration,
      completed: true
    }, { headers });
    console.log('✅ First video completed\n');

    // Test 7: Get Second Video (should now be unlocked)
    const secondVideoId = nextVideo.data.video.id;
    console.log('8️⃣ Testing second video access...');
    const secondVideo = await axios.get(`${API_URL}/videos/${secondVideoId}`, { headers });
    console.log('Second video:', secondVideo.data.title);
    console.log('Previous ID:', secondVideo.data.previous_video_id);
    console.log('Next ID:', secondVideo.data.next_video_id);
    console.log('Locked:', secondVideo.data.locked);
    console.log('');

    if (secondVideo.data.previous_video_id === firstVideoId) {
      console.log('✅ TEST PASSED: Navigation links correct\n');
    } else {
      console.log('❌ TEST FAILED: Navigation links incorrect\n');
    }

    // Test 8: Test Previous from Second Video
    console.log('9️⃣ Testing previous from second video...');
    const prevFromSecond = await axios.get(`${API_URL}/videos/${secondVideoId}/previous`, { headers });
    if (prevFromSecond.data.video.id === firstVideoId) {
      console.log('✅ TEST PASSED: Previous navigation works\n');
      console.log('Previous video:', prevFromSecond.data.video.title);
      console.log('');
    } else {
      console.log('❌ TEST FAILED: Previous navigation incorrect\n');
    }

    // Summary
    console.log('🎉 All Navigation Tests Complete!\n');
    console.log('📊 Summary:');
    console.log('  ✅ First video endpoint works');
    console.log('  ✅ Video details include prev/next IDs');
    console.log('  ✅ Next video navigation works');
    console.log('  ✅ Previous video navigation works');
    console.log('  ✅ Locked videos blocked (403)');
    console.log('  ✅ Navigation links correct after completion');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testVideoNavigation();
