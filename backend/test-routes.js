const express = require('express');

// Test if routes can be loaded
try {
  console.log('Testing route imports...');
  
  const quizRoutes = require('./src/modules/quiz/quiz.routes');
  console.log('✓ Quiz routes loaded');
  
  const codingRoutes = require('./src/modules/coding/coding.routes');
  console.log('✓ Coding routes loaded');
  
  console.log('\n✓ All routes loaded successfully!');
  console.log('\nYou can now run: npm run dev');
} catch (error) {
  console.error('Error loading routes:', error.message);
  console.error(error.stack);
}
