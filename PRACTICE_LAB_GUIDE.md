# Practice Lab Testing Guide

## Backend Setup

1. **Initialize Database**
```bash
cd backend
node init-practice-lab.js
```

2. **Start Backend Server**
```bash
npm run dev
```
Backend runs on: http://localhost:5000

## Frontend Setup

1. **Start Frontend**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

---

## API Testing with Postman/cURL

### 1. Quiz APIs

#### Get Quiz Questions
```bash
GET http://localhost:5000/quiz/subjects/1
Headers: Authorization: Bearer <your_access_token>
```

Expected Response:
```json
{
  "questions": [
    {
      "id": 1,
      "subject_id": 1,
      "question": "What is the correct way to declare a variable in JavaScript?",
      "option_a": "variable x = 5;",
      "option_b": "var x = 5;",
      "option_c": "v x = 5;",
      "option_d": "declare x = 5;",
      "difficulty": "Easy"
    }
  ]
}
```

#### Submit Quiz Answer
```bash
POST http://localhost:5000/quiz/submit
Headers: Authorization: Bearer <your_access_token>
Content-Type: application/json

Body:
{
  "question_id": 1,
  "selected_option": "B"
}
```

Expected Response:
```json
{
  "correct": true,
  "correct_option": "B",
  "explanation": "In JavaScript, variables are declared using var, let, or const keywords."
}
```

#### Get Quiz Stats
```bash
GET http://localhost:5000/quiz/stats/1
Headers: Authorization: Bearer <your_access_token>
```

Expected Response:
```json
{
  "total_attempts": 10,
  "correct_answers": 8,
  "accuracy": 80.00
}
```

---

### 2. Coding Practice APIs

#### Get Problems by Subject
```bash
GET http://localhost:5000/coding/problems/1
Headers: Authorization: Bearer <your_access_token>
```

Expected Response:
```json
{
  "problems": [
    {
      "id": 1,
      "subject_id": 1,
      "title": "Two Sum",
      "difficulty": "Easy",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Problem Details
```bash
GET http://localhost:5000/coding/problem/1
Headers: Authorization: Bearer <your_access_token>
```

Expected Response:
```json
{
  "id": 1,
  "subject_id": 1,
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "Easy",
  "starter_code_js": "function twoSum(nums, target) {...}",
  "starter_code_python": "def two_sum(nums, target):...",
  "starter_code_java": "class Solution {...}",
  "example_input": "nums = [2,7,11,15], target = 9",
  "example_output": "[0,1]",
  "constraints": "2 <= nums.length <= 10^4",
  "test_cases_json": [...]
}
```

#### Submit Code
```bash
POST http://localhost:5000/coding/submit
Headers: Authorization: Bearer <your_access_token>
Content-Type: application/json

Body:
{
  "problem_id": 1,
  "code": "function twoSum(nums, target) { const map = {}; for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map[complement] !== undefined) { return [map[complement], i]; } map[nums[i]] = i; } return []; }",
  "language": "javascript"
}
```

Expected Response:
```json
{
  "status": "Accepted",
  "passed_tests": 3,
  "total_tests": 3,
  "execution_time": 15
}
```

---

## Frontend Testing

### 1. Quiz Feature

**Steps:**
1. Login to the application
2. Navigate to Subjects page
3. Click "Quiz" button on any subject card
4. Answer questions one by one
5. View explanations after each answer
6. Complete the quiz to see final score

**Expected UI:**
- Question counter (e.g., "Question 1 / 10")
- Score tracker
- Difficulty badge (Easy/Medium/Hard)
- Radio button options
- Submit button (disabled until option selected)
- Result card with explanation
- Next button after viewing result

---

### 2. Coding Practice Feature

**Steps:**
1. Login to the application
2. Click "Practice Lab" button in navigation
3. Browse problems by subject
4. Click on a problem to open editor
5. Select programming language (JavaScript/Python/Java)
6. Write code in Monaco Editor
7. Click "Run" to test locally
8. Click "Submit" to run against test cases
9. View results in console output

**Expected UI:**
- Split view: Problem description (left) | Code editor (right)
- Language selector dropdown
- Reset, Run, and Submit buttons
- Monaco code editor with syntax highlighting
- Console output panel at bottom
- Test case results (passed/total)
- Status badge (Accepted/Wrong Answer/Runtime Error)

---

## Database Verification

Check data in MySQL:

```sql
-- View quiz questions
SELECT * FROM quiz_questions LIMIT 5;

-- View quiz attempts
SELECT * FROM quiz_attempts ORDER BY attempted_at DESC LIMIT 10;

-- View coding problems
SELECT id, title, difficulty FROM coding_problems;

-- View coding submissions
SELECT * FROM coding_submissions ORDER BY submitted_at DESC LIMIT 10;

-- Check user quiz stats
SELECT 
  u.name,
  COUNT(*) as attempts,
  SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END) as correct
FROM users u
JOIN quiz_attempts qa ON u.id = qa.user_id
GROUP BY u.id;
```

---

## Folder Structure

```
backend/
├── src/
│   └── modules/
│       ├── quiz/
│       │   ├── quiz.controller.ts
│       │   └── quiz.routes.ts
│       └── coding/
│           ├── coding.controller.ts
│           └── coding.routes.ts
├── schema-practice-lab.sql
├── seed-practice-lab.sql
└── init-practice-lab.js

frontend/
├── app/
│   ├── quiz/
│   │   └── [subjectId]/
│   │       └── page.tsx
│   └── practice/
│       ├── page.tsx
│       └── [problemId]/
│           └── page.tsx
└── components/
    ├── Quiz/
    │   ├── QuizQuestion.tsx
    │   └── QuizResult.tsx
    └── Practice/
        ├── ProblemDescription.tsx
        ├── CodeEditor.tsx
        └── ConsoleOutput.tsx
```

---

## Common Issues & Solutions

### Issue: Monaco Editor not loading
**Solution:** Ensure monaco-editor is installed:
```bash
npm install monaco-editor
```

### Issue: API returns 401 Unauthorized
**Solution:** Check JWT token is valid and included in Authorization header

### Issue: Code submission returns Runtime Error
**Solution:** Check code syntax and ensure function names match expected format

### Issue: Quiz questions not loading
**Solution:** Verify database has been seeded with init-practice-lab.js

---

## Success Criteria

✅ Backend APIs respond correctly
✅ Quiz questions load and can be answered
✅ Quiz results show correct/incorrect with explanations
✅ Coding problems list displays
✅ Code editor loads with syntax highlighting
✅ Language switching works (JS/Python/Java)
✅ Code submission runs test cases
✅ Console shows execution results
✅ Database stores attempts and submissions

---

## Next Steps

1. Add more quiz questions for all subjects
2. Add more coding problems with varying difficulty
3. Implement actual code execution (currently simulated)
4. Add leaderboard feature
5. Add problem filtering by difficulty
6. Add submission history view
7. Add hints system for coding problems
8. Add timer for quizzes
