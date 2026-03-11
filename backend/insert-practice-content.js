const mysql = require('mysql2/promise');
require('dotenv').config();

const jsQuestions = [
  ["What is JavaScript?", "A styling language", "A programming language", "A database", "An operating system", "B", "JavaScript is a high-level, interpreted programming language used for web development.", "Easy"],
  ["Which keyword declares a constant?", "var", "let", "const", "static", "C", "The const keyword is used to declare constants that cannot be reassigned.", "Easy"],
  ["What is the output of typeof null?", "null", "undefined", "object", "number", "C", "This is a known JavaScript quirk where typeof null returns object.", "Medium"],
  ["What does === operator do?", "Assignment", "Comparison without type coercion", "Comparison with type coercion", "Addition", "B", "The === operator checks both value and type equality without type conversion.", "Easy"],
  ["What is a closure?", "A loop structure", "A function with access to outer scope", "A class method", "A data type", "B", "A closure is a function that retains access to variables from its outer scope.", "Medium"]
];

async function insertContent() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Clearing old data...');
    await conn.query('DELETE FROM coding_submissions');
    await conn.query('DELETE FROM quiz_attempts');
    await conn.query('DELETE FROM coding_problems');
    await conn.query('DELETE FROM quiz_questions');
    
    console.log('Inserting quiz questions...');
    let count = 0;
    
    // Insert for each subject (15 subjects x 10 questions = 150)
    for (let subjectId = 1; subjectId <= 15; subjectId++) {
      const sectionId = (subjectId - 1) * 3 + 1;
      for (let q of jsQuestions) {
        await conn.query(
          'INSERT INTO quiz_questions (subject_id, section_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [subjectId, sectionId, q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7]]
        );
        count++;
      }
    }
    console.log(`✓ Inserted ${count} quiz questions`);

    console.log('Inserting coding problems...');
    count = 0;
    const problems = [
      ["Two Sum", "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.", "Easy", "function twoSum(nums, target) {\n  // Your code\n}", "def two_sum(nums, target):\n    pass", "nums = [2,7,11,15], target = 9", "[0,1]", '[{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}]'],
      ["Reverse String", "Write a function that reverses a string.", "Easy", "function reverseString(s) {\n  // Your code\n}", "def reverse_string(s):\n    pass", 's = "hello"', '"olleh"', '[{"input": {"s": "hello"}, "output": "olleh"}]'],
      ["Palindrome Check", "Given a string s, return true if it is a palindrome.", "Easy", "function isPalindrome(s) {\n  // Your code\n}", "def is_palindrome(s):\n    pass", 's = "racecar"', 'true', '[{"input": {"s": "racecar"}, "output": true}]'],
      ["FizzBuzz", "Return FizzBuzz array for n numbers.", "Easy", "function fizzBuzz(n) {\n  // Your code\n}", "def fizz_buzz(n):\n    pass", "n = 15", '["1","2","Fizz"]', '[{"input": {"n": 5}, "output": ["1","2","Fizz","4","Buzz"]}]'],
      ["Valid Anagram", "Check if two strings are anagrams.", "Easy", "function isAnagram(s, t) {\n  // Your code\n}", "def is_anagram(s, t):\n    pass", 's = "anagram", t = "nagaram"', 'true', '[{"input": {"s": "anagram", "t": "nagaram"}, "output": true}]']
    ];

    for (let subjectId = 1; subjectId <= 10; subjectId++) {
      for (let p of problems) {
        await conn.query(
          'INSERT INTO coding_problems (subject_id, title, description, difficulty, starter_code_js, starter_code_python, example_input, example_output, constraints, test_cases_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [subjectId, p[0], p[1], p[2], p[3], p[4], p[5], p[6], '1 <= n <= 10^4', p[7]]
        );
        count++;
      }
    }
    console.log(`✓ Inserted ${count} coding problems`);
    
    console.log('\n✓ Successfully loaded all content!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

insertContent();
