# Boilerplate Code Feature - Implementation Guide

## Overview
The coding practice interface includes a **Language Selector** that allows users to switch between JavaScript, Python, and Java. When a language is selected, the appropriate boilerplate code is automatically loaded for that specific coding question.

## How It Works

### 1. **Frontend - Language Selection** ([practice/[problemId]/page.tsx](frontend/app/practice/[problemId]/page.tsx))
- A dropdown menu in the navigation bar displays three language options:
  - JavaScript
  - Python  
  - Java

### 2. **Database Storage** ([schema-practice-lab.sql](backend/schema-practice-lab.sql))
Each coding problem stores boilerplate code for all three languages:
```sql
starter_code_js    -- JavaScript boilerplate
starter_code_python-- Python boilerplate
starter_code_java  -- Java boilerplate
```

### 3. **Sample Boilerplate Codes** ([seed-practice-lab.sql](backend/seed-practice-lab.sql))
**JavaScript Example:**
```javascript
function twoSum(nums, target) {
  // Write your code here
  
}
```

**Python Example:**
```python
def two_sum(nums, target):
    # Write your code here
    pass
```

**Java Example:**
```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        
    }
}
```

### 4. **Backend API** ([coding.controller.ts](backend/src/modules/coding/coding.controller.ts))
The `getProblemById` endpoint returns all fields including:
- `starter_code_js`
- `starter_code_python`
- `starter_code_java`

```typescript
const [problems] = await pool.query<RowDataPacket[]>(
  `SELECT * FROM coding_problems WHERE id = ?`,
  [problemId]
);
```

### 5. **Frontend Functionality**

#### Initial Load
When a problem loads, it defaults to JavaScript:
```typescript
setCode(data.starter_code_js || '// Write your code here');
```

#### Language Change Handler
When user selects a different language:
```typescript
const handleLanguageChange = (lang: string) => {
  setLanguage(lang);
  if (problem) {
    if (lang === 'javascript') setCode(problem.starter_code_js || '// Write your code here');
    else if (lang === 'python') setCode(problem.starter_code_python || '# Write your code here');
    else if (lang === 'java') setCode(problem.starter_code_java || '// Write your code here');
  }
};
```

#### Reset Button
The reset button also restores the boilerplate code for the currently selected language:
```typescript
const handleReset = () => {
  if (problem) {
    if (language === 'javascript') setCode(problem.starter_code_js || '// Write your code here');
    else if (language === 'python') setCode(problem.starter_code_python || '# Write your code here');
    else if (language === 'java') setCode(problem.starter_code_java || '// Write your code here');
  }
  setOutput('');
  setStatus('');
};
```

## User Flow

1. User clicks on a coding problem from the practice list
2. Problem loads with **JavaScript** boilerplate by default
3. User can select a different language from the dropdown in the top-right
4. Code editor automatically updates with the selected language's boilerplate
5. Monaco Editor displays syntax highlighting for the selected language
6. User can reset to the original boilerplate using the "Reset" button
7. Code submission works with the selected language

## Code Editor Components

### [CodeEditor.tsx](frontend/components/Practice/CodeEditor.tsx)
- Uses Monaco Editor for syntax highlighting
- Supports JavaScript, Python, and Java
- Real-time code change tracking via onChange callback

### [ConsoleOutput.tsx](frontend/components/Practice/ConsoleOutput.tsx)
- Displays execution results
- Shows test case pass/fail status

## Features Included

✅ **Language Switching** - Dropdown to select between JS, Python, Java  
✅ **Automatic Boilerplate Loading** - Code updates when language changes  
✅ **Syntax Highlighting** - Monaco Editor supports all three languages  
✅ **Reset Functionality** - Restore original boilerplate code  
✅ **Language-Specific Defaults** - Different defaults for each language  
✅ **Persistence in Database** - All boilerplate codes stored in DB  

## Navigation

- **Back to Problems** - Returns to practice problem list
- **Language Selector** - Top-right dropdown
- **Reset Button** - Restore original boilerplate
- **Run Button** - Execute code (in development)
- **Submit Button** - Submit solution for evaluation
