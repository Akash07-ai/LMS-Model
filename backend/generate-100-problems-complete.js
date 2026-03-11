const mysql = require('mysql2/promise');
require('dotenv').config();

async function generate100Problems() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Clearing existing coding problems...');
    await conn.query('DELETE FROM coding_submissions');
    await conn.query('DELETE FROM coding_problems');
    
    console.log('Generating 100 coding problems...\n');
    
    const subjects = [
      {id: 1, name: 'JavaScript Fundamentals', count: 10},
      {id: 2, name: 'React.js Concepts', count: 10},
      {id: 3, name: 'Node.js Backend', count: 10},
      {id: 4, name: 'Python Programming', count: 10},
      {id: 5, name: 'Data Structures', count: 15},
      {id: 6, name: 'Algorithms', count: 15},
      {id: 7, name: 'Machine Learning Basics', count: 10},
      {id: 8, name: 'Web Development', count: 10},
      {id: 9, name: 'Database Management', count: 5},
      {id: 10, name: 'Cloud Computing', count: 5}
    ];
    
    const problemTemplates = {
      easy: [
        {
          title: "Sum of Array",
          desc: "Calculate the sum of all elements in an array.",
          js: "function sumArray(arr) {\n  // Write your code here\n}\n\nconst input = [1, 2, 3, 4, 5];\nconsole.log(sumArray(input));",
          py: "def sum_array(arr):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    arr = [1, 2, 3, 4, 5]\n    print(sum_array(arr))",
          java: "import java.util.*;\n\npublic class Main {\n    public static int sumArray(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3, 4, 5};\n        System.out.println(sumArray(arr));\n    }\n}",
          input: "[1, 2, 3, 4, 5]",
          output: "15",
          tests: '[{"input": {"arr": [1,2,3,4,5]}, "output": 15}]'
        },
        {
          title: "Reverse String",
          desc: "Reverse a given string.",
          js: "function reverseString(str) {\n  // Write your code here\n}\n\nconst input = 'hello';\nconsole.log(reverseString(input));",
          py: "def reverse_string(s):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    s = 'hello'\n    print(reverse_string(s))",
          java: "import java.util.*;\n\npublic class Main {\n    public static String reverseString(String s) {\n        // Write your code here\n        return \"\";\n    }\n    public static void main(String[] args) {\n        String s = \"hello\";\n        System.out.println(reverseString(s));\n    }\n}",
          input: "hello",
          output: "olleh",
          tests: '[{"input": {"s": "hello"}, "output": "olleh"}]'
        },
        {
          title: "Find Maximum",
          desc: "Find the maximum element in an array.",
          js: "function findMax(arr) {\n  // Write your code here\n}\n\nconst input = [3, 7, 2, 9, 1];\nconsole.log(findMax(input));",
          py: "def find_max(arr):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    arr = [3, 7, 2, 9, 1]\n    print(find_max(arr))",
          java: "import java.util.*;\n\npublic class Main {\n    public static int findMax(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n    public static void main(String[] args) {\n        int[] arr = {3, 7, 2, 9, 1};\n        System.out.println(findMax(arr));\n    }\n}",
          input: "[3, 7, 2, 9, 1]",
          output: "9",
          tests: '[{"input": {"arr": [3,7,2,9,1]}, "output": 9}]'
        },
        {
          title: "Count Vowels",
          desc: "Count the number of vowels in a string.",
          js: "function countVowels(str) {\n  // Write your code here\n}\n\nconst input = 'hello world';\nconsole.log(countVowels(input));",
          py: "def count_vowels(s):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    s = 'hello world'\n    print(count_vowels(s))",
          java: "import java.util.*;\n\npublic class Main {\n    public static int countVowels(String s) {\n        // Write your code here\n        return 0;\n    }\n    public static void main(String[] args) {\n        String s = \"hello world\";\n        System.out.println(countVowels(s));\n    }\n}",
          input: "hello world",
          output: "3",
          tests: '[{"input": {"s": "hello world"}, "output": 3}]'
        }
      ],
      medium: [
        {
          title: "Two Sum",
          desc: "Find two numbers in array that add up to target.",
          js: "function twoSum(nums, target) {\n  // Write your code here\n}\n\nconst nums = [2, 7, 11, 15];\nconst target = 9;\nconsole.log(twoSum(nums, target));",
          py: "def two_sum(nums, target):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    nums = [2, 7, 11, 15]\n    target = 9\n    print(two_sum(nums, target))",
          java: "import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n    public static void main(String[] args) {\n        int[] nums = {2, 7, 11, 15};\n        int target = 9;\n        System.out.println(Arrays.toString(twoSum(nums, target)));\n    }\n}",
          input: "nums=[2,7,11,15], target=9",
          output: "[0, 1]",
          tests: '[{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]}]'
        },
        {
          title: "Valid Parentheses",
          desc: "Check if string has valid parentheses.",
          js: "function isValid(s) {\n  // Write your code here\n}\n\nconst input = '()[]{}';\nconsole.log(isValid(input));",
          py: "def is_valid(s):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    s = '()[]{}'\n    print(is_valid(s))",
          java: "import java.util.*;\n\npublic class Main {\n    public static boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n    public static void main(String[] args) {\n        String s = \"()[]{}\";\n        System.out.println(isValid(s));\n    }\n}",
          input: "()[]{}",
          output: "true",
          tests: '[{"input": {"s": "()[]{}"}, "output": true}]'
        }
      ],
      hard: [
        {
          title: "Merge K Sorted Lists",
          desc: "Merge k sorted linked lists into one sorted list.",
          js: "function mergeKLists(lists) {\n  // Write your code here\n}\n\nconst lists = [[1,4,5],[1,3,4],[2,6]];\nconsole.log(mergeKLists(lists));",
          py: "def merge_k_lists(lists):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    lists = [[1,4,5],[1,3,4],[2,6]]\n    print(merge_k_lists(lists))",
          java: "import java.util.*;\n\npublic class Main {\n    public static List<Integer> mergeKLists(List<List<Integer>> lists) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n    public static void main(String[] args) {\n        List<List<Integer>> lists = new ArrayList<>();\n        System.out.println(mergeKLists(lists));\n    }\n}",
          input: "[[1,4,5],[1,3,4],[2,6]]",
          output: "[1,1,2,3,4,4,5,6]",
          tests: '[{"input": {"lists": [[1,4,5],[1,3,4],[2,6]]}, "output": [1,1,2,3,4,4,5,6]}]'
        }
      ]
    };
    
    let count = 0;
    let easyCount = 0, mediumCount = 0, hardCount = 0;
    
    for (const subject of subjects) {
      const easyProblems = Math.floor(subject.count * 0.4);
      const mediumProblems = Math.floor(subject.count * 0.4);
      const hardProblems = subject.count - easyProblems - mediumProblems;
      
      // Insert Easy problems
      for (let i = 0; i < easyProblems; i++) {
        const template = problemTemplates.easy[i % problemTemplates.easy.length];
        await conn.query(
          'INSERT INTO coding_problems (subject_id, title, description, difficulty, starter_code_js, starter_code_python, starter_code_java, example_input, example_output, constraints, test_cases_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [subject.id, `${template.title} - ${subject.name}`, template.desc, 'Easy', template.js, template.py, template.java, template.input, template.output, '1 <= n <= 1000', template.tests]
        );
        count++;
        easyCount++;
      }
      
      // Insert Medium problems
      for (let i = 0; i < mediumProblems; i++) {
        const template = problemTemplates.medium[i % problemTemplates.medium.length];
        await conn.query(
          'INSERT INTO coding_problems (subject_id, title, description, difficulty, starter_code_js, starter_code_python, starter_code_java, example_input, example_output, constraints, test_cases_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [subject.id, `${template.title} - ${subject.name}`, template.desc, 'Medium', template.js, template.py, template.java, template.input, template.output, '1 <= n <= 10^4', template.tests]
        );
        count++;
        mediumCount++;
      }
      
      // Insert Hard problems
      for (let i = 0; i < hardProblems; i++) {
        const template = problemTemplates.hard[i % problemTemplates.hard.length];
        await conn.query(
          'INSERT INTO coding_problems (subject_id, title, description, difficulty, starter_code_js, starter_code_python, starter_code_java, example_input, example_output, constraints, test_cases_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [subject.id, `${template.title} - ${subject.name}`, template.desc, 'Hard', template.js, template.py, template.java, template.input, template.output, '1 <= n <= 10^5', template.tests]
        );
        count++;
        hardCount++;
      }
      
      console.log(`✓ ${subject.name}: ${subject.count} problems`);
    }
    
    console.log(`\n✓ Successfully generated ${count} coding problems!`);
    console.log(`  - Easy: ${easyCount}`);
    console.log(`  - Medium: ${mediumCount}`);
    console.log(`  - Hard: ${hardCount}`);
    console.log(`\nAll problems include boilerplate code for:`);
    console.log(`  - JavaScript`);
    console.log(`  - Python`);
    console.log(`  - Java`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

generate100Problems();
