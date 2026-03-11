const fs = require('fs');

const problems = [];

// JavaScript Problems (15)
const jsProblems = [
  {
    title: "Two Sum",
    desc: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
    difficulty: "Easy",
    js: "function twoSum(nums, target) {\n  // Your code here\n}",
    py: "def two_sum(nums, target):\n    # Your code here\n    pass",
    java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}",
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    constraints: "2 <= nums.length <= 10^4",
    tests: '[{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}, {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]}]'
  },
  {
    title: "Reverse String",
    desc: "Write a function that reverses a string.",
    difficulty: "Easy",
    js: "function reverseString(s) {\n  // Your code here\n}",
    py: "def reverse_string(s):\n    # Your code here\n    pass",
    java: "class Solution {\n    public String reverseString(String s) {\n        // Your code here\n    }\n}",
    input: 's = "hello"',
    output: '"olleh"',
    constraints: "1 <= s.length <= 10^5",
    tests: '[{"input": {"s": "hello"}, "output": "olleh"}, {"input": {"s": "world"}, "output": "dlrow"}]'
  },
  {
    title: "Palindrome Check",
    desc: "Given a string s, return true if it is a palindrome.",
    difficulty: "Easy",
    js: "function isPalindrome(s) {\n  // Your code here\n}",
    py: "def is_palindrome(s):\n    # Your code here\n    pass",
    java: "class Solution {\n    public boolean isPalindrome(String s) {\n        // Your code here\n    }\n}",
    input: 's = "racecar"',
    output: "true",
    constraints: "1 <= s.length <= 2 * 10^5",
    tests: '[{"input": {"s": "racecar"}, "output": true}, {"input": {"s": "hello"}, "output": false}]'
  },
  {
    title: "FizzBuzz",
    desc: "Given an integer n, return a string array where answer[i] == 'FizzBuzz' if i is divisible by 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, else i as string.",
    difficulty: "Easy",
    js: "function fizzBuzz(n) {\n  // Your code here\n}",
    py: "def fizz_buzz(n):\n    # Your code here\n    pass",
    java: "class Solution {\n    public List<String> fizzBuzz(int n) {\n        // Your code here\n    }\n}",
    input: "n = 15",
    output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
    constraints: "1 <= n <= 10^4",
    tests: '[{"input": {"n": 5}, "output": ["1","2","Fizz","4","Buzz"]}, {"input": {"n": 15}, "output": ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]}]'
  },
  {
    title: "Valid Anagram",
    desc: "Given two strings s and t, return true if t is an anagram of s.",
    difficulty: "Easy",
    js: "function isAnagram(s, t) {\n  // Your code here\n}",
    py: "def is_anagram(s, t):\n    # Your code here\n    pass",
    java: "class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Your code here\n    }\n}",
    input: 's = "anagram", t = "nagaram"',
    output: "true",
    constraints: "1 <= s.length, t.length <= 5 * 10^4",
    tests: '[{"input": {"s": "anagram", "t": "nagaram"}, "output": true}, {"input": {"s": "rat", "t": "car"}, "output": false}]'
  },
  {
    title: "Contains Duplicate",
    desc: "Given an integer array nums, return true if any value appears at least twice.",
    difficulty: "Easy",
    js: "function containsDuplicate(nums) {\n  // Your code here\n}",
    py: "def contains_duplicate(nums):\n    # Your code here\n    pass",
    java: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Your code here\n    }\n}",
    input: "nums = [1,2,3,1]",
    output: "true",
    constraints: "1 <= nums.length <= 10^5",
    tests: '[{"input": {"nums": [1,2,3,1]}, "output": true}, {"input": {"nums": [1,2,3,4]}, "output": false}]'
  },
  {
    title: "Maximum Subarray",
    desc: "Given an integer array nums, find the contiguous subarray with the largest sum.",
    difficulty: "Medium",
    js: "function maxSubArray(nums) {\n  // Your code here\n}",
    py: "def max_sub_array(nums):\n    # Your code here\n    pass",
    java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n    }\n}",
    input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
    output: "6",
    constraints: "1 <= nums.length <= 10^5",
    tests: '[{"input": {"nums": [-2,1,-3,4,-1,2,1,-5,4]}, "output": 6}, {"input": {"nums": [1]}, "output": 1}]'
  },
  {
    title: "Merge Two Sorted Lists",
    desc: "Merge two sorted linked lists and return it as a sorted list.",
    difficulty: "Easy",
    js: "function mergeTwoLists(l1, l2) {\n  // Your code here\n}",
    py: "def merge_two_lists(l1, l2):\n    # Your code here\n    pass",
    java: "class Solution {\n    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n        // Your code here\n    }\n}",
    input: "l1 = [1,2,4], l2 = [1,3,4]",
    output: "[1,1,2,3,4,4]",
    constraints: "0 <= l1.length, l2.length <= 50",
    tests: '[{"input": {"l1": [1,2,4], "l2": [1,3,4]}, "output": [1,1,2,3,4,4]}]'
  },
  {
    title: "Valid Parentheses",
    desc: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    js: "function isValid(s) {\n  // Your code here\n}",
    py: "def is_valid(s):\n    # Your code here\n    pass",
    java: "class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}",
    input: 's = "()[]{}"',
    output: "true",
    constraints: "1 <= s.length <= 10^4",
    tests: '[{"input": {"s": "()[]{}"}, "output": true}, {"input": {"s": "(]"}, "output": false}]'
  },
  {
    title: "Best Time to Buy and Sell Stock",
    desc: "Find the maximum profit from buying and selling stock once.",
    difficulty: "Easy",
    js: "function maxProfit(prices) {\n  // Your code here\n}",
    py: "def max_profit(prices):\n    # Your code here\n    pass",
    java: "class Solution {\n    public int maxProfit(int[] prices) {\n        // Your code here\n    }\n}",
    input: "prices = [7,1,5,3,6,4]",
    output: "5",
    constraints: "1 <= prices.length <= 10^5",
    tests: '[{"input": {"prices": [7,1,5,3,6,4]}, "output": 5}, {"input": {"prices": [7,6,4,3,1]}, "output": 0}]'
  },
  {
    title: "Single Number",
    desc: "Given a non-empty array where every element appears twice except one, find that single one.",
    difficulty: "Easy",
    js: "function singleNumber(nums) {\n  // Your code here\n}",
    py: "def single_number(nums):\n    # Your code here\n    pass",
    java: "class Solution {\n    public int singleNumber(int[] nums) {\n        // Your code here\n    }\n}",
    input: "nums = [2,2,1]",
    output: "1",
    constraints: "1 <= nums.length <= 3 * 10^4",
    tests: '[{"input": {"nums": [2,2,1]}, "output": 1}, {"input": {"nums": [4,1,2,1,2]}, "output": 4}]'
  },
  {
    title: "Climbing Stairs",
    desc: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
    difficulty: "Easy",
    js: "function climbStairs(n) {\n  // Your code here\n}",
    py: "def climb_stairs(n):\n    # Your code here\n    pass",
    java: "class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n    }\n}",
    input: "n = 3",
    output: "3",
    constraints: "1 <= n <= 45",
    tests: '[{"input": {"n": 2}, "output": 2}, {"input": {"n": 3}, "output": 3}]'
  },
  {
    title: "Reverse Linked List",
    desc: "Reverse a singly linked list.",
    difficulty: "Easy",
    js: "function reverseList(head) {\n  // Your code here\n}",
    py: "def reverse_list(head):\n    # Your code here\n    pass",
    java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n    }\n}",
    input: "head = [1,2,3,4,5]",
    output: "[5,4,3,2,1]",
    constraints: "0 <= list length <= 5000",
    tests: '[{"input": {"head": [1,2,3,4,5]}, "output": [5,4,3,2,1]}]'
  },
  {
    title: "Move Zeroes",
    desc: "Given an integer array nums, move all 0's to the end while maintaining the relative order of the non-zero elements.",
    difficulty: "Easy",
    js: "function moveZeroes(nums) {\n  // Your code here\n}",
    py: "def move_zeroes(nums):\n    # Your code here\n    pass",
    java: "class Solution {\n    public void moveZeroes(int[] nums) {\n        // Your code here\n    }\n}",
    input: "nums = [0,1,0,3,12]",
    output: "[1,3,12,0,0]",
    constraints: "1 <= nums.length <= 10^4",
    tests: '[{"input": {"nums": [0,1,0,3,12]}, "output": [1,3,12,0,0]}]'
  },
  {
    title: "Find First and Last Position",
    desc: "Given an array of integers sorted in ascending order, find the starting and ending position of a given target value.",
    difficulty: "Medium",
    js: "function searchRange(nums, target) {\n  // Your code here\n}",
    py: "def search_range(nums, target):\n    # Your code here\n    pass",
    java: "class Solution {\n    public int[] searchRange(int[] nums, int target) {\n        // Your code here\n    }\n}",
    input: "nums = [5,7,7,8,8,10], target = 8",
    output: "[3,4]",
    constraints: "0 <= nums.length <= 10^5",
    tests: '[{"input": {"nums": [5,7,7,8,8,10], "target": 8}, "output": [3,4]}]'
  }
];

// Generate SQL for coding problems
const subjectIds = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5];

for (let i = 0; i < 50; i++) {
  const prob = jsProblems[i % jsProblems.length];
  const subjectId = subjectIds[i];
  
  problems.push(`(${subjectId}, '${prob.title}', '${prob.desc.replace(/'/g, "''")}', '${prob.difficulty}', '${prob.js.replace(/'/g, "''")}', '${prob.py.replace(/'/g, "''")}', '${prob.java.replace(/'/g, "''")}', '${prob.input}', '${prob.output}', '${prob.constraints}', '${prob.tests}')`);
}

const sql = `-- Coding Problems (50+)
INSERT INTO coding_problems (subject_id, title, description, difficulty, starter_code_js, starter_code_python, starter_code_java, example_input, example_output, constraints, test_cases_json) VALUES
${problems.join(',\n')};
`;

fs.writeFileSync('seed-coding-large.sql', sql);
console.log(`✓ Generated ${problems.length} coding problems`);
