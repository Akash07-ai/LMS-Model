import { Request, Response } from 'express';

const roadmaps: Record<string, string> = {
  javascript: `📘 **JavaScript Roadmap**

**Beginner (Week 1–2)**
→ Variables, Data Types, Operators
→ Functions, Scope, Hoisting
→ Arrays & Objects

**Intermediate (Week 3–4)**
→ DOM Manipulation & Events
→ Promises, async/await, Fetch API
→ ES6+ (destructuring, spread, modules)

**Advanced (Week 5–6)**
→ Closures, Prototypes, \`this\` keyword
→ Event Loop & Call Stack
→ Design Patterns (Module, Observer)

💡 Build a todo app → weather app → full CRUD app after each phase.`,

  dsa: `🧠 **DSA Roadmap**

**Phase 1 — Foundations**
→ Arrays & Strings (2 weeks)
→ Linked Lists (1 week)
→ Stacks & Queues (1 week)

**Phase 2 — Core Algorithms**
→ Binary Search (3 days)
→ Recursion & Backtracking (1 week)
→ Sorting algorithms (3 days)

**Phase 3 — Advanced**
→ Trees & Graphs (2 weeks)
→ Dynamic Programming (2 weeks)
→ Heaps & Tries (1 week)

🎯 Target: 150+ LeetCode problems — 60% Easy, 30% Medium, 10% Hard.`,

  react: `⚛️ **React Roadmap**

**Week 1**
→ JSX, Components, Props
→ useState, useEffect
→ Event handling & conditional rendering

**Week 2**
→ useContext, useRef, useMemo
→ React Router v6
→ Forms & validation

**Week 3**
→ State management (Zustand / Redux Toolkit)
→ API integration with Axios
→ Error boundaries & Suspense

**Week 4**
→ Next.js App Router, SSR vs CSR vs SSG
→ Deploy to Vercel

💡 Build a full-stack app with auth by the end.`,

  systemdesign: `🏗️ **System Design Roadmap**

**Fundamentals**
→ Client-Server model, HTTP/HTTPS
→ DNS, CDN, Load Balancers
→ SQL vs NoSQL databases

**Scalability**
→ Horizontal vs Vertical scaling
→ Caching (Redis, Memcached)
→ Message Queues (Kafka, RabbitMQ)

**Design Patterns**
→ Microservices vs Monolith
→ API Gateway, Rate Limiting
→ CAP Theorem, Eventual Consistency

**Practice:** Design URL Shortener → Twitter Feed → WhatsApp`,

  python: `🐍 **Python Roadmap**

**Basics (Week 1)**
→ Syntax, Variables, Loops, Functions
→ Lists, Dicts, Tuples, Sets
→ File I/O, Exception handling

**Intermediate (Week 2–3)**
→ OOP: Classes, Inheritance, Dunder methods
→ Decorators, Generators, Context managers

**Advanced (Week 4+)**
→ Async programming (asyncio)
→ Web: FastAPI or Django
→ Data: NumPy, Pandas, Matplotlib

🎯 Pick a specialization: Web Dev, Data Science, or Automation.`,
};

const explanations: Record<string, string> = {
  closure: `🔒 **Closures in JavaScript**

**What it is:**
A closure is a function that remembers variables from its outer scope even after the outer function has finished.

**Code example:**
\`\`\`js
function makeCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}
const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3
\`\`\`

**Real-world analogy:** 🎒 A backpack — the inner function carries its outer variables wherever it goes.

**Use cases:** Data privacy, factory functions, memoization.`,

  promise: `⚡ **Promises in JavaScript**

**What it is:**
A Promise represents a future value — pending, fulfilled, or rejected.

**Code example:**
\`\`\`js
const fetchUser = (id) => new Promise((resolve, reject) => {
  setTimeout(() => {
    id > 0 ? resolve({ id, name: 'Akash' }) : reject(new Error('Invalid ID'));
  }, 1000);
});

fetchUser(1)
  .then(user => console.log(user))
  .catch(err => console.error(err));
\`\`\`

**Analogy:** 🍕 Ordering food online — you get a receipt (promise) immediately, then it's either delivered (resolved) or cancelled (rejected).`,

  async: `🔄 **Async/Await**

**What it is:**
Syntactic sugar over Promises — write async code that reads like synchronous code.

**Code example:**
\`\`\`js
async function loadDashboard(userId) {
  try {
    const user = await fetchUser(userId);
    const courses = await fetchCourses(user.id);
    return { user, courses };
  } catch (error) {
    console.error('Failed:', error.message);
  }
}
\`\`\`

**Rules:**
→ \`async\` functions always return a Promise
→ \`await\` pauses until the Promise resolves
→ Always use try/catch for error handling`,

  hoisting: `🏗️ **Hoisting in JavaScript**

**What it is:**
JS moves declarations to the top of their scope before execution.

**Code example:**
\`\`\`js
greet(); // ✅ Works — function is hoisted
function greet() { console.log("Hello!"); }

console.log(name); // undefined — var hoisted but not initialized
var name = "Akash";

console.log(age); // ❌ ReferenceError — let/const not initialized
let age = 25;
\`\`\`

**Key rule:** \`var\` → hoisted + initialized as \`undefined\`. \`let\`/\`const\` → hoisted but in "temporal dead zone".`,

  prototype: `🔗 **Prototypes in JavaScript**

**What it is:**
Every JS object has a hidden \`[[Prototype]]\` link — this chain enables inheritance.

**Code example:**
\`\`\`js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() {
  return this.name + ' makes a sound';
};

const dog = new Animal('Rex');
dog.speak(); // "Rex makes a sound"

// Modern ES6 class (same thing under the hood)
class Animal {
  constructor(name) { this.name = name; }
  speak() { return this.name + ' makes a sound'; }
}
\`\`\``,

  eventloop: `🔁 **Event Loop**

**What it is:**
JS is single-threaded but handles async via the Event Loop — processes call stack, then microtasks, then macrotasks.

**Execution order:**
\`\`\`js
console.log('1 - sync');
setTimeout(() => console.log('2 - macro'), 0);
Promise.resolve().then(() => console.log('3 - micro'));
console.log('4 - sync');
// Output: 1 → 4 → 3 → 2
\`\`\`

**Priority:**
1. Synchronous code (call stack)
2. Microtasks (Promises, queueMicrotask)
3. Macrotasks (setTimeout, setInterval, I/O)`,
};

function detectRoadmap(q: string): string | null {
  if (/\bjavascript\b|\bjs\b/.test(q)) return roadmaps.javascript;
  if (/dsa|data.?struct|algorithm/.test(q)) return roadmaps.dsa;
  if (/\breact\b|next\.?js/.test(q)) return roadmaps.react;
  if (/system.?design/.test(q)) return roadmaps.systemdesign;
  if (/\bpython\b/.test(q)) return roadmaps.python;
  return null;
}

function detectExplanation(q: string): string | null {
  if (/closure/.test(q)) return explanations.closure;
  if (/promise/.test(q)) return explanations.promise;
  if (/async|await/.test(q)) return explanations.async;
  if (/hoist/.test(q)) return explanations.hoisting;
  if (/prototype/.test(q)) return explanations.prototype;
  if (/event.?loop/.test(q)) return explanations.eventloop;
  return null;
}

function learnNextResponse(q: string): string {
  const roadmap = detectRoadmap(q);
  if (roadmap) return roadmap;

  return `🎯 **Personalized Learning Recommendation**

**This Week**
→ Complete your current course module
→ Solve 3 Easy + 1 Medium LeetCode problems daily
→ Review topics with < 70% quiz score

**Next 2 Weeks**
→ JavaScript: Closures, Prototypes, Event Loop
→ DSA: Binary Search, Two Pointers, Sliding Window
→ Build a mini project applying what you've learned

**Skill Gaps to Address**
→ Async programming patterns
→ Time & Space complexity analysis
→ Clean code & naming conventions

💡 Consistency beats intensity — 1 hour daily > 7 hours on Sunday.

Try: "JavaScript roadmap", "DSA roadmap", or "React roadmap" for a detailed plan!`;
}

function explainResponse(q: string): string {
  const explanation = detectExplanation(q);
  if (explanation) return explanation;

  const topicMatch = q.match(/(?:explain|what is|what are|how does|how do)\s+(.+)/i);
  const topic = topicMatch ? topicMatch[1].trim() : q;

  return `📖 **Explaining: ${topic}**

I have detailed explanations for: **closures**, **promises**, **async/await**, **hoisting**, **prototypes**, **event loop**.

For "${topic}", here's how to learn it fast:

**Step 1** — Read the MDN docs or JavaScript.info article on "${topic}"
**Step 2** — Find 2–3 code examples and run them yourself
**Step 3** — Build something small using the concept
**Step 4** — Write a 5-line explanation in your own words

💡 Try: "Explain closures" or "Explain async/await" for a full breakdown!`;
}

function generalResponse(q: string): string {
  if (/\bhello\b|\bhi\b|\bhey\b/.test(q)) {
    return `👋 **Hey! I'm your AI Learning Assistant.**

I can help you with:
→ 🗺️ **Roadmaps** — "JavaScript roadmap", "DSA roadmap", "React roadmap"
→ 📖 **Explanations** — "Explain closures", "Explain async/await"
→ 🎯 **What to learn next** — "What should I learn next?"
→ 💡 **Tips** — "Give me a coding tip"
→ ⏱️ **Complexity** — "Big O cheat sheet"
→ 🎯 **Interview prep** — "How to prepare for interviews"

What would you like to explore?`;
  }

  if (/tip|advice|best.?practice/.test(q)) {
    const tips = [
      `💡 **Tip: Name things clearly**\n\nBad: \`const x = arr.filter(i => i.a > 5).map(i => i.b);\`\nGood: \`const topStudents = students.filter(s => s.score > 5).map(s => s.name);\`\n\nCode is read 10× more than it's written.`,
      `💡 **Tip: Rubber Duck Debugging 🦆**\n\nExplain your code line-by-line out loud. The act of explaining forces you to think through the logic — you'll often find the bug before finishing.`,
      `💡 **Tip: The 20-minute rule**\n\nStruggle with a problem for 20 minutes before looking up the answer. This builds problem-solving muscle. After 20 min, look it up — but understand it, don't just copy it.`,
    ];
    return tips[new Date().getMinutes() % 3];
  }

  if (/big.?o|time.?complex|space.?complex/.test(q)) {
    return `⏱️ **Big O Complexity Cheat Sheet**

| Complexity | Name | Example |
|---|---|---|
| O(1) | Constant | Array index access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Single loop |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Nested loops |
| O(2ⁿ) | Exponential | Recursive fibonacci |

**Rule of thumb:**
→ n ≤ 10⁸ → O(n) is fine
→ n ≤ 10⁶ → O(n log n) is fine
→ n ≤ 10⁴ → O(n²) is fine`;
  }

  if (/interview|placement|job/.test(q)) {
    return `🎯 **Interview Preparation Guide**

**Technical Round**
→ Solve 150+ LeetCode (60% Easy, 30% Medium, 10% Hard)
→ Master: Arrays, Strings, Trees, Graphs, DP
→ Practice explaining your thought process out loud

**System Design Round**
→ Study: Scalability, Caching, Load Balancing, Databases
→ Practice: URL shortener, Twitter, WhatsApp designs

**Behavioral Round (STAR method)**
→ Situation → Task → Action → Result
→ Prepare 5–6 stories about challenges, teamwork, failures

**Timeline:**
→ 3 months: DSA + 1 project
→ 6 months: System Design + 2 projects`;
  }

  return `🤖 You asked: *"${q}"*

As your coding mentor, here's my advice:

1. Break the problem into smaller pieces
2. Search the specific concept on MDN or Stack Overflow
3. Write a small code snippet to test your understanding

**Try asking me:**
→ "Explain closures" — detailed topic breakdowns
→ "JavaScript roadmap" — full learning paths
→ "What should I learn next?" — personalized advice
→ "Coding tips" — best practices
→ "Big O cheat sheet" — complexity reference
→ "Interview prep" — job preparation guide`;
}

export const askAI = (req: Request, res: Response): void => {
  try {
    const { query } = req.body as { query?: string };

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const q = query.toLowerCase().trim();
    let answer: string;

    if (/learn.?next|what.*next|recommend|roadmap/.test(q)) {
      answer = learnNextResponse(q);
    } else if (/^explain\b|what is\b|what are\b|how does\b|how do\b/.test(q)) {
      answer = explainResponse(q);
    } else {
      answer = generalResponse(q);
    }

    res.json({ answer });
  } catch (err) {
    console.error('[AI] Error:', err);
    res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' });
  }
};
