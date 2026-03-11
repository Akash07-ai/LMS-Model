-- Coding Problems (50+)
INSERT INTO coding_problems (subject_id, title, description, difficulty, starter_code_js, starter_code_python, starter_code_java, example_input, example_output, constraints, test_cases_json) VALUES
(1, 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.', 'Easy', 'function twoSum(nums, target) {
  // Your code here
}', 'def two_sum(nums, target):
    # Your code here
    pass', 'class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}', 'nums = [2,7,11,15], target = 9', '[0,1]', '2 <= nums.length <= 10^4', '[{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}, {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]}]'),
(1, 'Reverse String', 'Write a function that reverses a string.', 'Easy', 'function reverseString(s) {
  // Your code here
}', 'def reverse_string(s):
    # Your code here
    pass', 'class Solution {
    public String reverseString(String s) {
        // Your code here
    }
}', 's = "hello"', '"olleh"', '1 <= s.length <= 10^5', '[{"input": {"s": "hello"}, "output": "olleh"}, {"input": {"s": "world"}, "output": "dlrow"}]'),
(1, 'Palindrome Check', 'Given a string s, return true if it is a palindrome.', 'Easy', 'function isPalindrome(s) {
  // Your code here
}', 'def is_palindrome(s):
    # Your code here
    pass', 'class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
    }
}', 's = "racecar"', 'true', '1 <= s.length <= 2 * 10^5', '[{"input": {"s": "racecar"}, "output": true}, {"input": {"s": "hello"}, "output": false}]'),
(1, 'FizzBuzz', 'Given an integer n, return a string array where answer[i] == ''FizzBuzz'' if i is divisible by 3 and 5, ''Fizz'' if divisible by 3, ''Buzz'' if divisible by 5, else i as string.', 'Easy', 'function fizzBuzz(n) {
  // Your code here
}', 'def fizz_buzz(n):
    # Your code here
    pass', 'class Solution {
    public List<String> fizzBuzz(int n) {
        // Your code here
    }
}', 'n = 15', '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', '1 <= n <= 10^4', '[{"input": {"n": 5}, "output": ["1","2","Fizz","4","Buzz"]}, {"input": {"n": 15}, "output": ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]}]'),
(1, 'Valid Anagram', 'Given two strings s and t, return true if t is an anagram of s.', 'Easy', 'function isAnagram(s, t) {
  // Your code here
}', 'def is_anagram(s, t):
    # Your code here
    pass', 'class Solution {
    public boolean isAnagram(String s, String t) {
        // Your code here
    }
}', 's = "anagram", t = "nagaram"', 'true', '1 <= s.length, t.length <= 5 * 10^4', '[{"input": {"s": "anagram", "t": "nagaram"}, "output": true}, {"input": {"s": "rat", "t": "car"}, "output": false}]'),
(1, 'Contains Duplicate', 'Given an integer array nums, return true if any value appears at least twice.', 'Easy', 'function containsDuplicate(nums) {
  // Your code here
}', 'def contains_duplicate(nums):
    # Your code here
    pass', 'class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Your code here
    }
}', 'nums = [1,2,3,1]', 'true', '1 <= nums.length <= 10^5', '[{"input": {"nums": [1,2,3,1]}, "output": true}, {"input": {"nums": [1,2,3,4]}, "output": false}]'),
(1, 'Maximum Subarray', 'Given an integer array nums, find the contiguous subarray with the largest sum.', 'Medium', 'function maxSubArray(nums) {
  // Your code here
}', 'def max_sub_array(nums):
    # Your code here
    pass', 'class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
    }
}', 'nums = [-2,1,-3,4,-1,2,1,-5,4]', '6', '1 <= nums.length <= 10^5', '[{"input": {"nums": [-2,1,-3,4,-1,2,1,-5,4]}, "output": 6}, {"input": {"nums": [1]}, "output": 1}]'),
(1, 'Merge Two Sorted Lists', 'Merge two sorted linked lists and return it as a sorted list.', 'Easy', 'function mergeTwoLists(l1, l2) {
  // Your code here
}', 'def merge_two_lists(l1, l2):
    # Your code here
    pass', 'class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        // Your code here
    }
}', 'l1 = [1,2,4], l2 = [1,3,4]', '[1,1,2,3,4,4]', '0 <= l1.length, l2.length <= 50', '[{"input": {"l1": [1,2,4], "l2": [1,3,4]}, "output": [1,1,2,3,4,4]}]'),
(1, 'Valid Parentheses', 'Given a string containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.', 'Easy', 'function isValid(s) {
  // Your code here
}', 'def is_valid(s):
    # Your code here
    pass', 'class Solution {
    public boolean isValid(String s) {
        // Your code here
    }
}', 's = "()[]{}"', 'true', '1 <= s.length <= 10^4', '[{"input": {"s": "()[]{}"}, "output": true}, {"input": {"s": "(]"}, "output": false}]'),
(1, 'Best Time to Buy and Sell Stock', 'Find the maximum profit from buying and selling stock once.', 'Easy', 'function maxProfit(prices) {
  // Your code here
}', 'def max_profit(prices):
    # Your code here
    pass', 'class Solution {
    public int maxProfit(int[] prices) {
        // Your code here
    }
}', 'prices = [7,1,5,3,6,4]', '5', '1 <= prices.length <= 10^5', '[{"input": {"prices": [7,1,5,3,6,4]}, "output": 5}, {"input": {"prices": [7,6,4,3,1]}, "output": 0}]'),
(1, 'Single Number', 'Given a non-empty array where every element appears twice except one, find that single one.', 'Easy', 'function singleNumber(nums) {
  // Your code here
}', 'def single_number(nums):
    # Your code here
    pass', 'class Solution {
    public int singleNumber(int[] nums) {
        // Your code here
    }
}', 'nums = [2,2,1]', '1', '1 <= nums.length <= 3 * 10^4', '[{"input": {"nums": [2,2,1]}, "output": 1}, {"input": {"nums": [4,1,2,1,2]}, "output": 4}]'),
(1, 'Climbing Stairs', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?', 'Easy', 'function climbStairs(n) {
  // Your code here
}', 'def climb_stairs(n):
    # Your code here
    pass', 'class Solution {
    public int climbStairs(int n) {
        // Your code here
    }
}', 'n = 3', '3', '1 <= n <= 45', '[{"input": {"n": 2}, "output": 2}, {"input": {"n": 3}, "output": 3}]'),
(1, 'Reverse Linked List', 'Reverse a singly linked list.', 'Easy', 'function reverseList(head) {
  // Your code here
}', 'def reverse_list(head):
    # Your code here
    pass', 'class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
    }
}', 'head = [1,2,3,4,5]', '[5,4,3,2,1]', '0 <= list length <= 5000', '[{"input": {"head": [1,2,3,4,5]}, "output": [5,4,3,2,1]}]'),
(1, 'Move Zeroes', 'Given an integer array nums, move all 0''s to the end while maintaining the relative order of the non-zero elements.', 'Easy', 'function moveZeroes(nums) {
  // Your code here
}', 'def move_zeroes(nums):
    # Your code here
    pass', 'class Solution {
    public void moveZeroes(int[] nums) {
        // Your code here
    }
}', 'nums = [0,1,0,3,12]', '[1,3,12,0,0]', '1 <= nums.length <= 10^4', '[{"input": {"nums": [0,1,0,3,12]}, "output": [1,3,12,0,0]}]'),
(1, 'Find First and Last Position', 'Given an array of integers sorted in ascending order, find the starting and ending position of a given target value.', 'Medium', 'function searchRange(nums, target) {
  // Your code here
}', 'def search_range(nums, target):
    # Your code here
    pass', 'class Solution {
    public int[] searchRange(int[] nums, int target) {
        // Your code here
    }
}', 'nums = [5,7,7,8,8,10], target = 8', '[3,4]', '0 <= nums.length <= 10^5', '[{"input": {"nums": [5,7,7,8,8,10], "target": 8}, "output": [3,4]}]'),
(2, 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.', 'Easy', 'function twoSum(nums, target) {
  // Your code here
}', 'def two_sum(nums, target):
    # Your code here
    pass', 'class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}', 'nums = [2,7,11,15], target = 9', '[0,1]', '2 <= nums.length <= 10^4', '[{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}, {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]}]'),
(2, 'Reverse String', 'Write a function that reverses a string.', 'Easy', 'function reverseString(s) {
  // Your code here
}', 'def reverse_string(s):
    # Your code here
    pass', 'class Solution {
    public String reverseString(String s) {
        // Your code here
    }
}', 's = "hello"', '"olleh"', '1 <= s.length <= 10^5', '[{"input": {"s": "hello"}, "output": "olleh"}, {"input": {"s": "world"}, "output": "dlrow"}]'),
(2, 'Palindrome Check', 'Given a string s, return true if it is a palindrome.', 'Easy', 'function isPalindrome(s) {
  // Your code here
}', 'def is_palindrome(s):
    # Your code here
    pass', 'class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
    }
}', 's = "racecar"', 'true', '1 <= s.length <= 2 * 10^5', '[{"input": {"s": "racecar"}, "output": true}, {"input": {"s": "hello"}, "output": false}]'),
(2, 'FizzBuzz', 'Given an integer n, return a string array where answer[i] == ''FizzBuzz'' if i is divisible by 3 and 5, ''Fizz'' if divisible by 3, ''Buzz'' if divisible by 5, else i as string.', 'Easy', 'function fizzBuzz(n) {
  // Your code here
}', 'def fizz_buzz(n):
    # Your code here
    pass', 'class Solution {
    public List<String> fizzBuzz(int n) {
        // Your code here
    }
}', 'n = 15', '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', '1 <= n <= 10^4', '[{"input": {"n": 5}, "output": ["1","2","Fizz","4","Buzz"]}, {"input": {"n": 15}, "output": ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]}]'),
(2, 'Valid Anagram', 'Given two strings s and t, return true if t is an anagram of s.', 'Easy', 'function isAnagram(s, t) {
  // Your code here
}', 'def is_anagram(s, t):
    # Your code here
    pass', 'class Solution {
    public boolean isAnagram(String s, String t) {
        // Your code here
    }
}', 's = "anagram", t = "nagaram"', 'true', '1 <= s.length, t.length <= 5 * 10^4', '[{"input": {"s": "anagram", "t": "nagaram"}, "output": true}, {"input": {"s": "rat", "t": "car"}, "output": false}]'),
(2, 'Contains Duplicate', 'Given an integer array nums, return true if any value appears at least twice.', 'Easy', 'function containsDuplicate(nums) {
  // Your code here
}', 'def contains_duplicate(nums):
    # Your code here
    pass', 'class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Your code here
    }
}', 'nums = [1,2,3,1]', 'true', '1 <= nums.length <= 10^5', '[{"input": {"nums": [1,2,3,1]}, "output": true}, {"input": {"nums": [1,2,3,4]}, "output": false}]'),
(2, 'Maximum Subarray', 'Given an integer array nums, find the contiguous subarray with the largest sum.', 'Medium', 'function maxSubArray(nums) {
  // Your code here
}', 'def max_sub_array(nums):
    # Your code here
    pass', 'class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
    }
}', 'nums = [-2,1,-3,4,-1,2,1,-5,4]', '6', '1 <= nums.length <= 10^5', '[{"input": {"nums": [-2,1,-3,4,-1,2,1,-5,4]}, "output": 6}, {"input": {"nums": [1]}, "output": 1}]'),
(2, 'Merge Two Sorted Lists', 'Merge two sorted linked lists and return it as a sorted list.', 'Easy', 'function mergeTwoLists(l1, l2) {
  // Your code here
}', 'def merge_two_lists(l1, l2):
    # Your code here
    pass', 'class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        // Your code here
    }
}', 'l1 = [1,2,4], l2 = [1,3,4]', '[1,1,2,3,4,4]', '0 <= l1.length, l2.length <= 50', '[{"input": {"l1": [1,2,4], "l2": [1,3,4]}, "output": [1,1,2,3,4,4]}]'),
(2, 'Valid Parentheses', 'Given a string containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.', 'Easy', 'function isValid(s) {
  // Your code here
}', 'def is_valid(s):
    # Your code here
    pass', 'class Solution {
    public boolean isValid(String s) {
        // Your code here
    }
}', 's = "()[]{}"', 'true', '1 <= s.length <= 10^4', '[{"input": {"s": "()[]{}"}, "output": true}, {"input": {"s": "(]"}, "output": false}]'),
(2, 'Best Time to Buy and Sell Stock', 'Find the maximum profit from buying and selling stock once.', 'Easy', 'function maxProfit(prices) {
  // Your code here
}', 'def max_profit(prices):
    # Your code here
    pass', 'class Solution {
    public int maxProfit(int[] prices) {
        // Your code here
    }
}', 'prices = [7,1,5,3,6,4]', '5', '1 <= prices.length <= 10^5', '[{"input": {"prices": [7,1,5,3,6,4]}, "output": 5}, {"input": {"prices": [7,6,4,3,1]}, "output": 0}]'),
(3, 'Single Number', 'Given a non-empty array where every element appears twice except one, find that single one.', 'Easy', 'function singleNumber(nums) {
  // Your code here
}', 'def single_number(nums):
    # Your code here
    pass', 'class Solution {
    public int singleNumber(int[] nums) {
        // Your code here
    }
}', 'nums = [2,2,1]', '1', '1 <= nums.length <= 3 * 10^4', '[{"input": {"nums": [2,2,1]}, "output": 1}, {"input": {"nums": [4,1,2,1,2]}, "output": 4}]'),
(3, 'Climbing Stairs', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?', 'Easy', 'function climbStairs(n) {
  // Your code here
}', 'def climb_stairs(n):
    # Your code here
    pass', 'class Solution {
    public int climbStairs(int n) {
        // Your code here
    }
}', 'n = 3', '3', '1 <= n <= 45', '[{"input": {"n": 2}, "output": 2}, {"input": {"n": 3}, "output": 3}]'),
(3, 'Reverse Linked List', 'Reverse a singly linked list.', 'Easy', 'function reverseList(head) {
  // Your code here
}', 'def reverse_list(head):
    # Your code here
    pass', 'class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
    }
}', 'head = [1,2,3,4,5]', '[5,4,3,2,1]', '0 <= list length <= 5000', '[{"input": {"head": [1,2,3,4,5]}, "output": [5,4,3,2,1]}]'),
(3, 'Move Zeroes', 'Given an integer array nums, move all 0''s to the end while maintaining the relative order of the non-zero elements.', 'Easy', 'function moveZeroes(nums) {
  // Your code here
}', 'def move_zeroes(nums):
    # Your code here
    pass', 'class Solution {
    public void moveZeroes(int[] nums) {
        // Your code here
    }
}', 'nums = [0,1,0,3,12]', '[1,3,12,0,0]', '1 <= nums.length <= 10^4', '[{"input": {"nums": [0,1,0,3,12]}, "output": [1,3,12,0,0]}]'),
(3, 'Find First and Last Position', 'Given an array of integers sorted in ascending order, find the starting and ending position of a given target value.', 'Medium', 'function searchRange(nums, target) {
  // Your code here
}', 'def search_range(nums, target):
    # Your code here
    pass', 'class Solution {
    public int[] searchRange(int[] nums, int target) {
        // Your code here
    }
}', 'nums = [5,7,7,8,8,10], target = 8', '[3,4]', '0 <= nums.length <= 10^5', '[{"input": {"nums": [5,7,7,8,8,10], "target": 8}, "output": [3,4]}]'),
(3, 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.', 'Easy', 'function twoSum(nums, target) {
  // Your code here
}', 'def two_sum(nums, target):
    # Your code here
    pass', 'class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}', 'nums = [2,7,11,15], target = 9', '[0,1]', '2 <= nums.length <= 10^4', '[{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}, {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]}]'),
(3, 'Reverse String', 'Write a function that reverses a string.', 'Easy', 'function reverseString(s) {
  // Your code here
}', 'def reverse_string(s):
    # Your code here
    pass', 'class Solution {
    public String reverseString(String s) {
        // Your code here
    }
}', 's = "hello"', '"olleh"', '1 <= s.length <= 10^5', '[{"input": {"s": "hello"}, "output": "olleh"}, {"input": {"s": "world"}, "output": "dlrow"}]'),
(3, 'Palindrome Check', 'Given a string s, return true if it is a palindrome.', 'Easy', 'function isPalindrome(s) {
  // Your code here
}', 'def is_palindrome(s):
    # Your code here
    pass', 'class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
    }
}', 's = "racecar"', 'true', '1 <= s.length <= 2 * 10^5', '[{"input": {"s": "racecar"}, "output": true}, {"input": {"s": "hello"}, "output": false}]'),
(3, 'FizzBuzz', 'Given an integer n, return a string array where answer[i] == ''FizzBuzz'' if i is divisible by 3 and 5, ''Fizz'' if divisible by 3, ''Buzz'' if divisible by 5, else i as string.', 'Easy', 'function fizzBuzz(n) {
  // Your code here
}', 'def fizz_buzz(n):
    # Your code here
    pass', 'class Solution {
    public List<String> fizzBuzz(int n) {
        // Your code here
    }
}', 'n = 15', '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', '1 <= n <= 10^4', '[{"input": {"n": 5}, "output": ["1","2","Fizz","4","Buzz"]}, {"input": {"n": 15}, "output": ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]}]'),
(3, 'Valid Anagram', 'Given two strings s and t, return true if t is an anagram of s.', 'Easy', 'function isAnagram(s, t) {
  // Your code here
}', 'def is_anagram(s, t):
    # Your code here
    pass', 'class Solution {
    public boolean isAnagram(String s, String t) {
        // Your code here
    }
}', 's = "anagram", t = "nagaram"', 'true', '1 <= s.length, t.length <= 5 * 10^4', '[{"input": {"s": "anagram", "t": "nagaram"}, "output": true}, {"input": {"s": "rat", "t": "car"}, "output": false}]'),
(4, 'Contains Duplicate', 'Given an integer array nums, return true if any value appears at least twice.', 'Easy', 'function containsDuplicate(nums) {
  // Your code here
}', 'def contains_duplicate(nums):
    # Your code here
    pass', 'class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Your code here
    }
}', 'nums = [1,2,3,1]', 'true', '1 <= nums.length <= 10^5', '[{"input": {"nums": [1,2,3,1]}, "output": true}, {"input": {"nums": [1,2,3,4]}, "output": false}]'),
(4, 'Maximum Subarray', 'Given an integer array nums, find the contiguous subarray with the largest sum.', 'Medium', 'function maxSubArray(nums) {
  // Your code here
}', 'def max_sub_array(nums):
    # Your code here
    pass', 'class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
    }
}', 'nums = [-2,1,-3,4,-1,2,1,-5,4]', '6', '1 <= nums.length <= 10^5', '[{"input": {"nums": [-2,1,-3,4,-1,2,1,-5,4]}, "output": 6}, {"input": {"nums": [1]}, "output": 1}]'),
(4, 'Merge Two Sorted Lists', 'Merge two sorted linked lists and return it as a sorted list.', 'Easy', 'function mergeTwoLists(l1, l2) {
  // Your code here
}', 'def merge_two_lists(l1, l2):
    # Your code here
    pass', 'class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        // Your code here
    }
}', 'l1 = [1,2,4], l2 = [1,3,4]', '[1,1,2,3,4,4]', '0 <= l1.length, l2.length <= 50', '[{"input": {"l1": [1,2,4], "l2": [1,3,4]}, "output": [1,1,2,3,4,4]}]'),
(4, 'Valid Parentheses', 'Given a string containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.', 'Easy', 'function isValid(s) {
  // Your code here
}', 'def is_valid(s):
    # Your code here
    pass', 'class Solution {
    public boolean isValid(String s) {
        // Your code here
    }
}', 's = "()[]{}"', 'true', '1 <= s.length <= 10^4', '[{"input": {"s": "()[]{}"}, "output": true}, {"input": {"s": "(]"}, "output": false}]'),
(4, 'Best Time to Buy and Sell Stock', 'Find the maximum profit from buying and selling stock once.', 'Easy', 'function maxProfit(prices) {
  // Your code here
}', 'def max_profit(prices):
    # Your code here
    pass', 'class Solution {
    public int maxProfit(int[] prices) {
        // Your code here
    }
}', 'prices = [7,1,5,3,6,4]', '5', '1 <= prices.length <= 10^5', '[{"input": {"prices": [7,1,5,3,6,4]}, "output": 5}, {"input": {"prices": [7,6,4,3,1]}, "output": 0}]'),
(4, 'Single Number', 'Given a non-empty array where every element appears twice except one, find that single one.', 'Easy', 'function singleNumber(nums) {
  // Your code here
}', 'def single_number(nums):
    # Your code here
    pass', 'class Solution {
    public int singleNumber(int[] nums) {
        // Your code here
    }
}', 'nums = [2,2,1]', '1', '1 <= nums.length <= 3 * 10^4', '[{"input": {"nums": [2,2,1]}, "output": 1}, {"input": {"nums": [4,1,2,1,2]}, "output": 4}]'),
(4, 'Climbing Stairs', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?', 'Easy', 'function climbStairs(n) {
  // Your code here
}', 'def climb_stairs(n):
    # Your code here
    pass', 'class Solution {
    public int climbStairs(int n) {
        // Your code here
    }
}', 'n = 3', '3', '1 <= n <= 45', '[{"input": {"n": 2}, "output": 2}, {"input": {"n": 3}, "output": 3}]'),
(4, 'Reverse Linked List', 'Reverse a singly linked list.', 'Easy', 'function reverseList(head) {
  // Your code here
}', 'def reverse_list(head):
    # Your code here
    pass', 'class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
    }
}', 'head = [1,2,3,4,5]', '[5,4,3,2,1]', '0 <= list length <= 5000', '[{"input": {"head": [1,2,3,4,5]}, "output": [5,4,3,2,1]}]'),
(4, 'Move Zeroes', 'Given an integer array nums, move all 0''s to the end while maintaining the relative order of the non-zero elements.', 'Easy', 'function moveZeroes(nums) {
  // Your code here
}', 'def move_zeroes(nums):
    # Your code here
    pass', 'class Solution {
    public void moveZeroes(int[] nums) {
        // Your code here
    }
}', 'nums = [0,1,0,3,12]', '[1,3,12,0,0]', '1 <= nums.length <= 10^4', '[{"input": {"nums": [0,1,0,3,12]}, "output": [1,3,12,0,0]}]'),
(4, 'Find First and Last Position', 'Given an array of integers sorted in ascending order, find the starting and ending position of a given target value.', 'Medium', 'function searchRange(nums, target) {
  // Your code here
}', 'def search_range(nums, target):
    # Your code here
    pass', 'class Solution {
    public int[] searchRange(int[] nums, int target) {
        // Your code here
    }
}', 'nums = [5,7,7,8,8,10], target = 8', '[3,4]', '0 <= nums.length <= 10^5', '[{"input": {"nums": [5,7,7,8,8,10], "target": 8}, "output": [3,4]}]'),
(5, 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.', 'Easy', 'function twoSum(nums, target) {
  // Your code here
}', 'def two_sum(nums, target):
    # Your code here
    pass', 'class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}', 'nums = [2,7,11,15], target = 9', '[0,1]', '2 <= nums.length <= 10^4', '[{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}, {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]}]'),
(5, 'Reverse String', 'Write a function that reverses a string.', 'Easy', 'function reverseString(s) {
  // Your code here
}', 'def reverse_string(s):
    # Your code here
    pass', 'class Solution {
    public String reverseString(String s) {
        // Your code here
    }
}', 's = "hello"', '"olleh"', '1 <= s.length <= 10^5', '[{"input": {"s": "hello"}, "output": "olleh"}, {"input": {"s": "world"}, "output": "dlrow"}]'),
(5, 'Palindrome Check', 'Given a string s, return true if it is a palindrome.', 'Easy', 'function isPalindrome(s) {
  // Your code here
}', 'def is_palindrome(s):
    # Your code here
    pass', 'class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
    }
}', 's = "racecar"', 'true', '1 <= s.length <= 2 * 10^5', '[{"input": {"s": "racecar"}, "output": true}, {"input": {"s": "hello"}, "output": false}]'),
(5, 'FizzBuzz', 'Given an integer n, return a string array where answer[i] == ''FizzBuzz'' if i is divisible by 3 and 5, ''Fizz'' if divisible by 3, ''Buzz'' if divisible by 5, else i as string.', 'Easy', 'function fizzBuzz(n) {
  // Your code here
}', 'def fizz_buzz(n):
    # Your code here
    pass', 'class Solution {
    public List<String> fizzBuzz(int n) {
        // Your code here
    }
}', 'n = 15', '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', '1 <= n <= 10^4', '[{"input": {"n": 5}, "output": ["1","2","Fizz","4","Buzz"]}, {"input": {"n": 15}, "output": ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]}]'),
(5, 'Valid Anagram', 'Given two strings s and t, return true if t is an anagram of s.', 'Easy', 'function isAnagram(s, t) {
  // Your code here
}', 'def is_anagram(s, t):
    # Your code here
    pass', 'class Solution {
    public boolean isAnagram(String s, String t) {
        // Your code here
    }
}', 's = "anagram", t = "nagaram"', 'true', '1 <= s.length, t.length <= 5 * 10^4', '[{"input": {"s": "anagram", "t": "nagaram"}, "output": true}, {"input": {"s": "rat", "t": "car"}, "output": false}]');
