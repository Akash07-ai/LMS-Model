const fs = require('fs');

const problems = {
  "problems": [
    // JavaScript Fundamentals (10 problems: 4 Easy, 4 Medium, 2 Hard)
    {
      "problem_id": 1,
      "title": "Sum of Array",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Easy",
      "description": "Given an array of integers, return the sum of all elements.",
      "input_format": "Array of integers",
      "output_format": "Integer (sum)",
      "constraints": "1 <= array.length <= 1000, -1000 <= array[i] <= 1000",
      "example_input": "[1, 2, 3, 4, 5]",
      "example_output": "15",
      "explanation": "1 + 2 + 3 + 4 + 5 = 15",
      "test_cases": [
        {"input": "[1, 2, 3, 4, 5]", "output": "15"},
        {"input": "[10, -5, 3]", "output": "8"},
        {"input": "[0]", "output": "0"}
      ],
      "boilerplate": {
        "javascript": "function sumArray(arr) {\n  // Write your code here\n}\n\nconst input = [1, 2, 3, 4, 5];\nconsole.log(sumArray(input));",
        "python": "def sum_array(arr):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    arr = [1, 2, 3, 4, 5]\n    print(sum_array(arr))",
        "java": "import java.util.*;\n\npublic class Main {\n    public static int sumArray(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3, 4, 5};\n        System.out.println(sumArray(arr));\n    }\n}"
      }
    },
    {
      "problem_id": 2,
      "title": "Find Maximum",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Easy",
      "description": "Find the maximum element in an array.",
      "input_format": "Array of integers",
      "output_format": "Integer (maximum value)",
      "constraints": "1 <= array.length <= 1000",
      "example_input": "[3, 7, 2, 9, 1]",
      "example_output": "9",
      "explanation": "9 is the largest number in the array",
      "test_cases": [
        {"input": "[3, 7, 2, 9, 1]", "output": "9"},
        {"input": "[-5, -1, -10]", "output": "-1"}
      ],
      "boilerplate": {
        "javascript": "function findMax(arr) {\n  // Write your code here\n}\n\nconst input = [3, 7, 2, 9, 1];\nconsole.log(findMax(input));",
        "python": "def find_max(arr):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    arr = [3, 7, 2, 9, 1]\n    print(find_max(arr))",
        "java": "import java.util.*;\n\npublic class Main {\n    public static int findMax(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        int[] arr = {3, 7, 2, 9, 1};\n        System.out.println(findMax(arr));\n    }\n}"
      }
    },
    {
      "problem_id": 3,
      "title": "Count Vowels",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Easy",
      "description": "Count the number of vowels (a, e, i, o, u) in a string.",
      "input_format": "String",
      "output_format": "Integer (count of vowels)",
      "constraints": "1 <= string.length <= 1000",
      "example_input": "hello world",
      "example_output": "3",
      "explanation": "e, o, o are the vowels",
      "test_cases": [
        {"input": "hello world", "output": "3"},
        {"input": "aeiou", "output": "5"},
        {"input": "xyz", "output": "0"}
      ],
      "boilerplate": {
        "javascript": "function countVowels(str) {\n  // Write your code here\n}\n\nconst input = 'hello world';\nconsole.log(countVowels(input));",
        "python": "def count_vowels(s):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    s = 'hello world'\n    print(count_vowels(s))",
        "java": "import java.util.*;\n\npublic class Main {\n    public static int countVowels(String s) {\n        // Write your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        String s = \"hello world\";\n        System.out.println(countVowels(s));\n    }\n}"
      }
    },
    {
      "problem_id": 4,
      "title": "Remove Duplicates",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Easy",
      "description": "Remove duplicate elements from an array and return unique elements.",
      "input_format": "Array of integers",
      "output_format": "Array of unique integers",
      "constraints": "1 <= array.length <= 1000",
      "example_input": "[1, 2, 2, 3, 4, 4, 5]",
      "example_output": "[1, 2, 3, 4, 5]",
      "explanation": "Duplicates removed",
      "test_cases": [
        {"input": "[1, 2, 2, 3, 4, 4, 5]", "output": "[1, 2, 3, 4, 5]"},
        {"input": "[1, 1, 1]", "output": "[1]"}
      ],
      "boilerplate": {
        "javascript": "function removeDuplicates(arr) {\n  // Write your code here\n}\n\nconst input = [1, 2, 2, 3, 4, 4, 5];\nconsole.log(removeDuplicates(input));",
        "python": "def remove_duplicates(arr):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    arr = [1, 2, 2, 3, 4, 4, 5]\n    print(remove_duplicates(arr))",
        "java": "import java.util.*;\n\npublic class Main {\n    public static List<Integer> removeDuplicates(int[] arr) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n    \n    public static void main(String[] args) {\n        int[] arr = {1, 2, 2, 3, 4, 4, 5};\n        System.out.println(removeDuplicates(arr));\n    }\n}"
      }
    },
    {
      "problem_id": 5,
      "title": "Flatten Nested Array",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Medium",
      "description": "Flatten a nested array into a single-level array.",
      "input_format": "Nested array",
      "output_format": "Flattened array",
      "constraints": "Depth <= 5",
      "example_input": "[1, [2, [3, 4], 5]]",
      "example_output": "[1, 2, 3, 4, 5]",
      "explanation": "All nested arrays flattened",
      "test_cases": [
        {"input": "[1, [2, [3, 4], 5]]", "output": "[1, 2, 3, 4, 5]"},
        {"input": "[[1], [2], [3]]", "output": "[1, 2, 3]"}
      ],
      "boilerplate": {
        "javascript": "function flattenArray(arr) {\n  // Write your code here\n}\n\nconst input = [1, [2, [3, 4], 5]];\nconsole.log(flattenArray(input));",
        "python": "def flatten_array(arr):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    arr = [1, [2, [3, 4], 5]]\n    print(flatten_array(arr))",
        "java": "import java.util.*;\n\npublic class Main {\n    public static List<Integer> flattenArray(Object[] arr) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n    \n    public static void main(String[] args) {\n        Object[] arr = {1, new Object[]{2, new Object[]{3, 4}, 5}};\n        System.out.println(flattenArray(arr));\n    }\n}"
      }
    },
    {
      "problem_id": 6,
      "title": "Deep Clone Object",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Medium",
      "description": "Create a deep clone of a JavaScript object.",
      "input_format": "Object",
      "output_format": "Cloned object",
      "constraints": "Object depth <= 10",
      "example_input": "{a: 1, b: {c: 2}}",
      "example_output": "{a: 1, b: {c: 2}}",
      "explanation": "Deep copy created",
      "test_cases": [
        {"input": "{a: 1, b: {c: 2}}", "output": "{a: 1, b: {c: 2}}"}
      ],
      "boilerplate": {
        "javascript": "function deepClone(obj) {\n  // Write your code here\n}\n\nconst input = {a: 1, b: {c: 2}};\nconsole.log(deepClone(input));",
        "python": "def deep_clone(obj):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    obj = {'a': 1, 'b': {'c': 2}}\n    print(deep_clone(obj))",
        "java": "import java.util.*;\n\npublic class Main {\n    public static Map<String, Object> deepClone(Map<String, Object> obj) {\n        // Write your code here\n        return new HashMap<>();\n    }\n    \n    public static void main(String[] args) {\n        Map<String, Object> obj = new HashMap<>();\n        System.out.println(deepClone(obj));\n    }\n}"
      }
    },
    {
      "problem_id": 7,
      "title": "Debounce Function",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Medium",
      "description": "Implement a debounce function that delays execution.",
      "input_format": "Function and delay time",
      "output_format": "Debounced function",
      "constraints": "delay >= 0",
      "example_input": "func, 300ms",
      "example_output": "debounced function",
      "explanation": "Function executes after delay",
      "test_cases": [
        {"input": "func, 300", "output": "debounced"}
      ],
      "boilerplate": {
        "javascript": "function debounce(func, delay) {\n  // Write your code here\n}\n\nconst debouncedFunc = debounce(() => console.log('Called'), 300);",
        "python": "import time\n\ndef debounce(func, delay):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    debounced = debounce(lambda: print('Called'), 0.3)",
        "java": "import java.util.*;\nimport java.util.function.*;\n\npublic class Main {\n    public static Runnable debounce(Runnable func, int delay) {\n        // Write your code here\n        return null;\n    }\n    \n    public static void main(String[] args) {\n        Runnable debounced = debounce(() -> System.out.println(\"Called\"), 300);\n    }\n}"
      }
    },
    {
      "problem_id": 8,
      "title": "Curry Function",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Medium",
      "description": "Implement function currying.",
      "input_format": "Function",
      "output_format": "Curried function",
      "constraints": "Function arity <= 5",
      "example_input": "add(a, b, c)",
      "example_output": "add(a)(b)(c)",
      "explanation": "Function is curried",
      "test_cases": [
        {"input": "add(1, 2, 3)", "output": "6"}
      ],
      "boilerplate": {
        "javascript": "function curry(func) {\n  // Write your code here\n}\n\nconst add = (a, b, c) => a + b + c;\nconst curriedAdd = curry(add);\nconsole.log(curriedAdd(1)(2)(3));",
        "python": "def curry(func):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    def add(a, b, c):\n        return a + b + c\n    curried = curry(add)\n    print(curried(1)(2)(3))",
        "java": "import java.util.function.*;\n\npublic class Main {\n    public static Function curry(Function func) {\n        // Write your code here\n        return null;\n    }\n    \n    public static void main(String[] args) {\n        // Implementation\n    }\n}"
      }
    },
    {
      "problem_id": 9,
      "title": "Event Emitter",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Hard",
      "description": "Implement an event emitter with on, emit, and off methods.",
      "input_format": "Event name and callback",
      "output_format": "Event emitter object",
      "constraints": "Event names are strings",
      "example_input": "on('click', callback)",
      "example_output": "Event registered",
      "explanation": "Event system implemented",
      "test_cases": [
        {"input": "emit('click')", "output": "callback executed"}
      ],
      "boilerplate": {
        "javascript": "class EventEmitter {\n  constructor() {\n    // Write your code here\n  }\n  \n  on(event, callback) {\n    // Write your code here\n  }\n  \n  emit(event, ...args) {\n    // Write your code here\n  }\n  \n  off(event, callback) {\n    // Write your code here\n  }\n}\n\nconst emitter = new EventEmitter();\nemitter.on('test', () => console.log('Event fired'));\nemitter.emit('test');",
        "python": "class EventEmitter:\n    def __init__(self):\n        # Write your code here\n        pass\n    \n    def on(self, event, callback):\n        # Write your code here\n        pass\n    \n    def emit(self, event, *args):\n        # Write your code here\n        pass\n    \n    def off(self, event, callback):\n        # Write your code here\n        pass\n\nif __name__ == '__main__':\n    emitter = EventEmitter()\n    emitter.on('test', lambda: print('Event fired'))\n    emitter.emit('test')",
        "java": "import java.util.*;\nimport java.util.function.*;\n\nclass EventEmitter {\n    // Write your code here\n    \n    public void on(String event, Runnable callback) {\n        // Write your code here\n    }\n    \n    public void emit(String event) {\n        // Write your code here\n    }\n    \n    public void off(String event, Runnable callback) {\n        // Write your code here\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        EventEmitter emitter = new EventEmitter();\n        emitter.on(\"test\", () -> System.out.println(\"Event fired\"));\n        emitter.emit(\"test\");\n    }\n}"
      }
    },
    {
      "problem_id": 10,
      "title": "Promise All Implementation",
      "subject": "JavaScript Fundamentals",
      "difficulty": "Hard",
      "description": "Implement Promise.all functionality.",
      "input_format": "Array of promises",
      "output_format": "Promise resolving to array of results",
      "constraints": "Valid promises",
      "example_input": "[Promise1, Promise2]",
      "example_output": "[result1, result2]",
      "explanation": "All promises resolved",
      "test_cases": [
        {"input": "[Promise.resolve(1), Promise.resolve(2)]", "output": "[1, 2]"}
      ],
      "boilerplate": {
        "javascript": "function promiseAll(promises) {\n  // Write your code here\n}\n\nconst p1 = Promise.resolve(1);\nconst p2 = Promise.resolve(2);\npromiseAll([p1, p2]).then(console.log);",
        "python": "import asyncio\n\nasync def promise_all(promises):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    # Implementation\n    pass",
        "java": "import java.util.concurrent.*;\nimport java.util.*;\n\npublic class Main {\n    public static CompletableFuture<List<Object>> promiseAll(List<CompletableFuture<?>> promises) {\n        // Write your code here\n        return null;\n    }\n    \n    public static void main(String[] args) {\n        // Implementation\n    }\n}"
      }
    }
  ]
};

// Save first 10 problems
fs.writeFileSync('coding-problems-part1.json', JSON.stringify(problems, null, 2));
console.log('✓ Generated first 10 problems (JavaScript Fundamentals)');
console.log('  - 4 Easy, 4 Medium, 2 Hard');
console.log('  - All with boilerplate code for JS, Python, Java');
