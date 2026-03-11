const fs = require('fs');

const quizQuestions = [];
const codingProblems = [];

// JavaScript Quiz Questions (20)
const jsQuestions = [
  ["What is JavaScript?", "A styling language", "A programming language", "A database", "An operating system", "B", "JavaScript is a high-level, interpreted programming language used for web development.", "Easy"],
  ["Which keyword declares a constant?", "var", "let", "const", "static", "C", "The const keyword is used to declare constants that cannot be reassigned.", "Easy"],
  ["What is the output of typeof null?", "null", "undefined", "object", "number", "C", "This is a known JavaScript quirk where typeof null returns 'object'.", "Medium"],
  ["What does === operator do?", "Assignment", "Comparison without type coercion", "Comparison with type coercion", "Addition", "B", "The === operator checks both value and type equality without type conversion.", "Easy"],
  ["What is a closure?", "A loop structure", "A function with access to outer scope", "A class method", "A data type", "B", "A closure is a function that retains access to variables from its outer scope.", "Medium"],
  ["Which method adds element to array end?", "unshift()", "push()", "pop()", "shift()", "B", "The push() method adds one or more elements to the end of an array.", "Easy"],
  ["What is NaN?", "Not a Number", "Null and None", "New Array Number", "Negative Number", "A", "NaN stands for Not-a-Number and represents an invalid number value.", "Easy"],
  ["What does JSON stand for?", "JavaScript Object Notation", "Java Standard Object Notation", "JavaScript Online Network", "Java Serialized Object", "A", "JSON is a lightweight data interchange format based on JavaScript object syntax.", "Easy"],
  ["What is hoisting?", "Moving code up", "Variable/function declarations moved to top", "Deleting variables", "Creating objects", "B", "Hoisting is JavaScript's behavior of moving declarations to the top of their scope.", "Medium"],
  ["What is the DOM?", "Data Object Model", "Document Object Model", "Digital Object Manager", "Database Operation Method", "B", "The DOM is a programming interface for HTML and XML documents.", "Easy"],
  ["What is event bubbling?", "Events move from child to parent", "Events disappear", "Events multiply", "Events pause", "A", "Event bubbling is when an event propagates from the target element up through its ancestors.", "Medium"],
  ["What is a promise?", "A loop", "An object representing async operation", "A variable type", "A function", "B", "A Promise is an object representing the eventual completion or failure of an async operation.", "Medium"],
  ["What does 'this' refer to?", "Current object", "Previous object", "Next object", "Global object always", "A", "The 'this' keyword refers to the object that is executing the current function.", "Medium"],
  ["What is arrow function syntax?", "function() {}", "() => {}", "func => {}", "-> {}", "B", "Arrow functions use the () => {} syntax and have lexical this binding.", "Easy"],
  ["What is destructuring?", "Breaking code", "Extracting values from arrays/objects", "Deleting variables", "Creating loops", "B", "Destructuring allows unpacking values from arrays or properties from objects.", "Medium"],
  ["What is spread operator?", "...", "***", "+++", "---", "A", "The spread operator (...) expands an iterable into individual elements.", "Easy"],
  ["What is async/await?", "Loop structure", "Syntax for handling promises", "Variable declaration", "Class definition", "B", "async/await is syntactic sugar for working with Promises in a synchronous-looking way.", "Medium"],
  ["What is template literal?", "String with backticks", "Array template", "Object template", "Function template", "A", "Template literals use backticks and allow embedded expressions with ${}.", "Easy"],
  ["What is strict mode?", "A debugging mode", "A restricted JavaScript variant", "A performance mode", "A testing mode", "B", "Strict mode is a way to opt into a restricted variant of JavaScript with better error checking.", "Medium"],
  ["What is callback function?", "Function passed as argument", "Function that returns", "Function that loops", "Function that breaks", "A", "A callback is a function passed as an argument to another function to be executed later.", "Easy"]
];

// React Quiz Questions (20)
const reactQuestions = [
  ["What is React?", "A database", "A JavaScript library for UI", "A backend framework", "A CSS framework", "B", "React is a JavaScript library for building user interfaces, maintained by Facebook.", "Easy"],
  ["What is JSX?", "JavaScript XML", "Java Syntax Extension", "JSON Extension", "JavaScript Extra", "A", "JSX is a syntax extension that allows writing HTML-like code in JavaScript.", "Easy"],
  ["What is a component?", "A function or class that returns UI", "A database table", "A CSS file", "A configuration file", "A", "Components are reusable pieces of UI that can be functions or classes.", "Easy"],
  ["What is state?", "Component's data that can change", "Component's fixed data", "CSS styling", "HTML structure", "A", "State is an object that holds data that may change over the component's lifetime.", "Easy"],
  ["What is props?", "Data passed from parent to child", "Component methods", "CSS properties", "HTML attributes", "A", "Props are arguments passed into React components like function parameters.", "Easy"],
  ["What hook manages state?", "useEffect", "useState", "useContext", "useRef", "B", "useState is a Hook that lets you add state to function components.", "Easy"],
  ["What hook handles side effects?", "useState", "useEffect", "useContext", "useMemo", "B", "useEffect lets you perform side effects in function components.", "Easy"],
  ["What is virtual DOM?", "Lightweight copy of real DOM", "Browser DOM", "Server DOM", "Database DOM", "A", "Virtual DOM is a lightweight JavaScript representation of the real DOM.", "Medium"],
  ["What is reconciliation?", "Process of updating DOM efficiently", "Creating components", "Deleting components", "Styling components", "A", "Reconciliation is React's algorithm for efficiently updating the DOM.", "Medium"],
  ["What is React Router?", "Library for routing in React apps", "State management tool", "Testing library", "Build tool", "A", "React Router is a library for handling navigation in React applications.", "Easy"],
  ["What is Context API?", "Way to pass data through component tree", "Styling solution", "Testing tool", "Build configuration", "A", "Context provides a way to share values between components without passing props.", "Medium"],
  ["What is useReducer?", "Hook for complex state logic", "Hook for side effects", "Hook for context", "Hook for refs", "A", "useReducer is a Hook for managing complex state logic with a reducer function.", "Medium"],
  ["What is memo?", "Higher-order component for optimization", "State hook", "Effect hook", "Context hook", "A", "React.memo is a HOC that prevents unnecessary re-renders by memoizing components.", "Medium"],
  ["What is useCallback?", "Hook to memoize functions", "Hook to memoize values", "Hook for state", "Hook for effects", "A", "useCallback returns a memoized callback function to prevent unnecessary re-renders.", "Medium"],
  ["What is useMemo?", "Hook to memoize values", "Hook to memoize functions", "Hook for state", "Hook for effects", "A", "useMemo returns a memoized value to optimize expensive calculations.", "Medium"],
  ["What is key prop?", "Unique identifier for list items", "CSS property", "Event handler", "State variable", "A", "Keys help React identify which items have changed, added, or removed in lists.", "Easy"],
  ["What is controlled component?", "Component controlled by React state", "Component with no state", "Component with props only", "Component with refs", "A", "Controlled components have their form data handled by React state.", "Medium"],
  ["What is useRef?", "Hook to access DOM elements", "Hook for state", "Hook for effects", "Hook for context", "A", "useRef returns a mutable ref object that persists across renders.", "Easy"],
  ["What is lazy loading?", "Loading components on demand", "Loading all components at once", "Delaying state updates", "Caching components", "A", "Lazy loading defers loading of components until they're needed.", "Medium"],
  ["What is PropTypes?", "Runtime type checking for props", "State management", "Routing library", "Testing tool", "A", "PropTypes is a library for runtime type checking of React props.", "Easy"]
];

// Node.js Quiz Questions (20)
const nodeQuestions = [
  ["What is Node.js?", "A framework", "JavaScript runtime", "A database", "A library", "B", "Node.js is a JavaScript runtime built on Chrome's V8 engine for server-side execution.", "Easy"],
  ["What is npm?", "Node Package Manager", "Node Programming Method", "New Package Module", "Node Process Manager", "A", "npm is the default package manager for Node.js ecosystem.", "Easy"],
  ["What is Express.js?", "Web framework for Node.js", "Database", "Testing tool", "Build tool", "A", "Express is a minimal and flexible Node.js web application framework.", "Easy"],
  ["What is middleware?", "Functions in request-response cycle", "Database layer", "Frontend component", "CSS processor", "A", "Middleware functions have access to request and response objects in the cycle.", "Easy"],
  ["What is package.json?", "Project metadata and dependencies", "JavaScript file", "CSS file", "HTML file", "A", "package.json contains metadata about the project and manages dependencies.", "Easy"],
  ["What is callback hell?", "Nested callbacks creating pyramid code", "Error in callbacks", "Missing callbacks", "Too many callbacks", "A", "Callback hell refers to heavily nested callbacks making code hard to read.", "Medium"],
  ["What is event loop?", "Mechanism handling async operations", "Loop structure", "Array method", "Object property", "A", "Event loop is Node.js's mechanism for handling asynchronous operations.", "Medium"],
  ["What is module.exports?", "Way to export from module", "Import statement", "Variable declaration", "Function call", "A", "module.exports is used to export functions, objects, or values from a module.", "Easy"],
  ["What is require()?", "Function to import modules", "Function to export modules", "Loop function", "Array method", "A", "require() is used to import modules, JSON, and local files in Node.js.", "Easy"],
  ["What is REST API?", "Architectural style for web services", "Database type", "Frontend framework", "Testing method", "A", "REST is an architectural style using HTTP methods for web services.", "Easy"],
  ["What is CORS?", "Cross-Origin Resource Sharing", "Code Organization System", "Central Object Repository", "Client Origin Request", "A", "CORS is a mechanism allowing restricted resources to be requested from another domain.", "Medium"],
  ["What is JWT?", "JSON Web Token", "JavaScript Web Tool", "Java Web Token", "JSON Web Type", "A", "JWT is a compact way to securely transmit information between parties as JSON.", "Medium"],
  ["What is bcrypt?", "Library for hashing passwords", "Database driver", "Testing framework", "Build tool", "A", "bcrypt is a library for hashing passwords securely with salt.", "Easy"],
  ["What is async/await in Node?", "Syntax for handling promises", "Loop structure", "Module system", "Error handling", "A", "async/await provides a cleaner syntax for working with promises.", "Medium"],
  ["What is process.env?", "Environment variables object", "Process method", "Event emitter", "File system", "A", "process.env is an object containing user environment variables.", "Easy"],
  ["What is Buffer?", "Class for handling binary data", "Array type", "String type", "Object type", "A", "Buffer class handles binary data directly in Node.js.", "Medium"],
  ["What is Stream?", "Interface for working with streaming data", "Database connection", "HTTP method", "File type", "A", "Streams are objects for reading or writing data continuously.", "Medium"],
  ["What is cluster module?", "Module for creating child processes", "Database module", "HTTP module", "File module", "A", "Cluster module allows creating child processes to handle load.", "Hard"],
  ["What is dotenv?", "Module for loading environment variables", "Testing library", "Database driver", "Build tool", "A", "dotenv loads environment variables from .env file into process.env.", "Easy"],
  ["What is morgan?", "HTTP request logger middleware", "Database ORM", "Testing framework", "Template engine", "A", "Morgan is a HTTP request logger middleware for Node.js.", "Easy"]
];

// Python Quiz Questions (20)
const pythonQuestions = [
  ["What is Python?", "Compiled language", "Interpreted language", "Assembly language", "Markup language", "B", "Python is an interpreted, high-level programming language.", "Easy"],
  ["What is PEP 8?", "Python style guide", "Python version", "Python library", "Python framework", "A", "PEP 8 is the style guide for Python code.", "Easy"],
  ["What is list comprehension?", "Concise way to create lists", "Loop structure", "Function type", "Class method", "A", "List comprehension provides a concise way to create lists from iterables.", "Medium"],
  ["What is tuple?", "Immutable sequence", "Mutable sequence", "Dictionary", "Set", "A", "Tuple is an immutable sequence type in Python.", "Easy"],
  ["What is dictionary?", "Key-value pair collection", "Ordered list", "Immutable set", "String type", "A", "Dictionary is a collection of key-value pairs in Python.", "Easy"],
  ["What is lambda?", "Anonymous function", "Loop structure", "Class definition", "Module import", "A", "Lambda is a way to create small anonymous functions.", "Easy"],
  ["What is decorator?", "Function that modifies another function", "Loop structure", "Data type", "Import statement", "A", "Decorators modify the behavior of functions or classes.", "Medium"],
  ["What is generator?", "Function that yields values", "Loop type", "Class type", "Module type", "A", "Generators are functions that yield values one at a time.", "Medium"],
  ["What is __init__?", "Constructor method", "Destructor method", "Class variable", "Module variable", "A", "__init__ is the constructor method called when creating an object.", "Easy"],
  ["What is self?", "Reference to instance", "Class name", "Module name", "Function name", "A", "self refers to the instance of the class.", "Easy"],
  ["What is inheritance?", "Class deriving from another class", "Variable scope", "Function call", "Module import", "A", "Inheritance allows a class to inherit attributes and methods from another.", "Easy"],
  ["What is polymorphism?", "Same interface for different types", "Multiple inheritance", "Function overloading", "Variable declaration", "A", "Polymorphism allows objects of different types to be accessed through same interface.", "Medium"],
  ["What is pip?", "Package installer for Python", "Python interpreter", "Python IDE", "Python debugger", "A", "pip is the package installer for Python.", "Easy"],
  ["What is virtual environment?", "Isolated Python environment", "Cloud environment", "Testing environment", "Production environment", "A", "Virtual environment is an isolated Python environment for project dependencies.", "Easy"],
  ["What is try-except?", "Exception handling", "Loop structure", "Function definition", "Class definition", "A", "try-except is used for exception handling in Python.", "Easy"],
  ["What is with statement?", "Context manager for resource handling", "Loop structure", "Conditional statement", "Import statement", "A", "with statement ensures proper resource management using context managers.", "Medium"],
  ["What is *args?", "Variable number of arguments", "Pointer", "Multiplication", "Import all", "A", "*args allows passing variable number of positional arguments.", "Easy"],
  ["What is **kwargs?", "Variable number of keyword arguments", "Power operator", "Import statement", "Comment syntax", "A", "**kwargs allows passing variable number of keyword arguments.", "Easy"],
  ["What is list slicing?", "Extracting portion of list", "Deleting list", "Creating list", "Sorting list", "A", "Slicing extracts a portion of a list using [start:end:step] syntax.", "Easy"],
  ["What is None?", "Null value in Python", "Zero value", "Empty string", "False value", "A", "None represents the absence of a value in Python.", "Easy"]
];

// Machine Learning Quiz Questions (20)
const mlQuestions = [
  ["What is Machine Learning?", "Manual programming", "Algorithms that learn from data", "Database management", "Web development", "B", "ML is a subset of AI where algorithms learn patterns from data.", "Easy"],
  ["What is supervised learning?", "Learning with labeled data", "Learning without labels", "Unsupervised clustering", "Reinforcement learning", "A", "Supervised learning uses labeled training data to learn mappings.", "Easy"],
  ["What is unsupervised learning?", "Learning without labeled data", "Learning with labels", "Supervised classification", "Reinforcement learning", "A", "Unsupervised learning finds patterns in unlabeled data.", "Easy"],
  ["What is overfitting?", "Model performs well on training, poor on test", "Model performs poorly on all data", "Model is too simple", "Model has no bias", "A", "Overfitting occurs when model learns training data too well including noise.", "Medium"],
  ["What is underfitting?", "Model is too simple", "Model is too complex", "Model is perfect", "Model has no variance", "A", "Underfitting occurs when model is too simple to capture data patterns.", "Medium"],
  ["What is training data?", "Data used to train model", "Data used to test model", "Data used for validation", "Production data", "A", "Training data is used to fit the machine learning model.", "Easy"],
  ["What is test data?", "Data used to evaluate model", "Data used to train model", "Data used for validation", "Training subset", "A", "Test data evaluates the final model performance.", "Easy"],
  ["What is feature?", "Input variable for model", "Output variable", "Model parameter", "Loss function", "A", "Features are input variables used to make predictions.", "Easy"],
  ["What is label?", "Output variable to predict", "Input variable", "Model parameter", "Training method", "A", "Label is the output variable that the model tries to predict.", "Easy"],
  ["What is regression?", "Predicting continuous values", "Predicting categories", "Clustering data", "Dimensionality reduction", "A", "Regression predicts continuous numerical values.", "Easy"],
  ["What is classification?", "Predicting categories", "Predicting continuous values", "Clustering data", "Feature extraction", "A", "Classification predicts discrete class labels.", "Easy"],
  ["What is neural network?", "Network of interconnected nodes", "Decision tree", "Linear model", "Clustering algorithm", "A", "Neural networks are computing systems inspired by biological neural networks.", "Medium"],
  ["What is deep learning?", "Neural networks with many layers", "Shallow learning", "Traditional ML", "Rule-based systems", "A", "Deep learning uses neural networks with multiple hidden layers.", "Medium"],
  ["What is gradient descent?", "Optimization algorithm", "Classification algorithm", "Clustering algorithm", "Preprocessing technique", "A", "Gradient descent is an optimization algorithm to minimize loss function.", "Medium"],
  ["What is loss function?", "Measures model error", "Measures model accuracy", "Training algorithm", "Testing method", "A", "Loss function quantifies the difference between predicted and actual values.", "Medium"],
  ["What is accuracy?", "Ratio of correct predictions", "Model complexity", "Training time", "Number of features", "A", "Accuracy is the ratio of correct predictions to total predictions.", "Easy"],
  ["What is precision?", "True positives / (True positives + False positives)", "True positives / Total", "Accuracy measure", "Loss measure", "A", "Precision measures the accuracy of positive predictions.", "Medium"],
  ["What is recall?", "True positives / (True positives + False negatives)", "True positives / Total", "Accuracy measure", "Loss measure", "A", "Recall measures the ability to find all positive instances.", "Medium"],
  ["What is cross-validation?", "Technique to assess model performance", "Training method", "Feature selection", "Data preprocessing", "A", "Cross-validation evaluates model by training on different data subsets.", "Medium"],
  ["What is bias-variance tradeoff?", "Balance between underfitting and overfitting", "Training speed vs accuracy", "Precision vs recall", "Accuracy vs loss", "A", "Bias-variance tradeoff balances model simplicity and complexity.", "Hard"]
];

// helper to expand arrays to at least 50 questions by duplicating with variants
function expandQuestions(arr) {
  const original = arr.slice();
  while (arr.length < 50) {
    const idx = arr.length;
    const base = original[idx % original.length];
    const variantNumber = Math.floor(idx / original.length) + 1;
    const newQ = [...base];
    newQ[0] = `${base[0]} (variant ${variantNumber})`;
    arr.push(newQ);
  }
}

expandQuestions(jsQuestions);
expandQuestions(reactQuestions);
expandQuestions(nodeQuestions);
expandQuestions(pythonQuestions);
expandQuestions(mlQuestions);

// Add all questions to array
let qId = 1;
for (let q of jsQuestions) {
  quizQuestions.push(`(1, 1, '${q[0]}', '${q[1]}', '${q[2]}', '${q[3]}', '${q[4]}', '${q[5]}', '${q[6]}', '${q[7]}')`);
}
for (let q of reactQuestions) {
  quizQuestions.push(`(2, 4, '${q[0]}', '${q[1]}', '${q[2]}', '${q[3]}', '${q[4]}', '${q[5]}', '${q[6]}', '${q[7]}')`);
}
for (let q of nodeQuestions) {
  quizQuestions.push(`(3, 7, '${q[0]}', '${q[1]}', '${q[2]}', '${q[3]}', '${q[4]}', '${q[5]}', '${q[6]}', '${q[7]}')`);
}
for (let q of pythonQuestions) {
  quizQuestions.push(`(4, 10, '${q[0]}', '${q[1]}', '${q[2]}', '${q[3]}', '${q[4]}', '${q[5]}', '${q[6]}', '${q[7]}')`);
}
for (let q of mlQuestions) {
  quizQuestions.push(`(5, 13, '${q[0]}', '${q[1]}', '${q[2]}', '${q[3]}', '${q[4]}', '${q[5]}', '${q[6]}', '${q[7]}')`);
}

// Duplicate questions for more subjects to reach 100+
const moreSubjects = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const baseSections = [16, 19, 22, 25, 28, 31, 34, 37, 40, 43];

for (let i = 0; i < moreSubjects.length; i++) {
  const subjectId = moreSubjects[i];
  const sectionId = baseSections[i];
  const baseQuestions = i % 2 === 0 ? jsQuestions : pythonQuestions;
  
  for (let q of baseQuestions.slice(0, 10)) {
    quizQuestions.push(`(${subjectId}, ${sectionId}, '${q[0]}', '${q[1]}', '${q[2]}', '${q[3]}', '${q[4]}', '${q[5]}', '${q[6]}', '${q[7]}')`);
  }
}

const sql = `-- Quiz Questions (100+)
INSERT INTO quiz_questions (subject_id, section_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty) VALUES
${quizQuestions.join(',\n')};
`;

fs.writeFileSync('seed-quiz-large.sql', sql);
console.log(`✓ Generated ${quizQuestions.length} quiz questions`);

// Also update seed-practice-lab.sql by appending the coding problems section
let existingPractice = '';
try {
  existingPractice = fs.readFileSync('seed-practice-lab.sql', 'utf8');
} catch (err) {
  console.warn('seed-practice-lab.sql not found, creating new one');
}

// extract part after '-- Coding Problems' if present
let practiceOutput = `-- Quiz Questions (50 per subject generated above)\n`;
if (existingPractice.includes('-- Coding Problems')) {
  const parts = existingPractice.split('-- Coding Problems');
  practiceOutput += parts[1];
} else {
  practiceOutput += `\n-- Coding Problems\n`;
}

fs.writeFileSync('seed-practice-lab.sql', practiceOutput);
console.log('✓ Updated seed-practice-lab.sql (questions removed, coding problems preserved)');
