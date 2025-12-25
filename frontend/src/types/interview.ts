export interface InterviewSession {
  id: string;
  code: string;
  language: string;
  createdAt: Date;
}

export interface CodeChange {
  sessionId: string;
  code: string;
  language: string;
  userId: string;
  timestamp: number;
}

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python';

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
];

export const DEFAULT_CODE: Record<SupportedLanguage, string> = {
  javascript: `// Welcome to your coding interview!
// Write your solution below

function solution(input) {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  typescript: `// Welcome to your coding interview!
// Write your solution below

function solution(input: string): string {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  python: `# Welcome to your coding interview!
# Write your solution below

def solution(input):
    # Your code here
    return input

# Test your solution
print(solution("Hello, World!"))
`,
};
