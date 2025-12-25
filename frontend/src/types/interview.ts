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
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust';

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
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
  java: `// Welcome to your coding interview!
// Write your solution below

public class Solution {
    public static String solution(String input) {
        // Your code here
        return input;
    }
    
    public static void main(String[] args) {
        System.out.println(solution("Hello, World!"));
    }
}
`,
  cpp: `// Welcome to your coding interview!
// Write your solution below

#include <iostream>
#include <string>

std::string solution(std::string input) {
    // Your code here
    return input;
}

int main() {
    std::cout << solution("Hello, World!") << std::endl;
    return 0;
}
`,
  csharp: `// Welcome to your coding interview!
// Write your solution below

using System;

class Solution {
    static string Solve(string input) {
        // Your code here
        return input;
    }
    
    static void Main() {
        Console.WriteLine(Solve("Hello, World!"));
    }
}
`,
  go: `// Welcome to your coding interview!
// Write your solution below

package main

import "fmt"

func solution(input string) string {
    // Your code here
    return input
}

func main() {
    fmt.Println(solution("Hello, World!"))
}
`,
  rust: `// Welcome to your coding interview!
// Write your solution below

fn solution(input: &str) -> String {
    // Your code here
    input.to_string()
}

fn main() {
    println!("{}", solution("Hello, World!"));
}
`,
};
