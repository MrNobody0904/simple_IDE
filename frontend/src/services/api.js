/**
 * OA IDE API Service
 * Handles code execution, problem fetching, and test case submissions
 */

const API_BASE = '/api';

export const LANGUAGES = [
  { id: 'cpp', name: 'C++17 (GCC 9.2)', monaco: 'cpp', ext: 'cpp' },
  { id: 'cpp20', name: 'C++20 (GCC 14)', monaco: 'cpp', ext: 'cpp' },
  { id: 'python', name: 'Python 3', monaco: 'python', ext: 'py' },
  { id: 'java', name: 'Java (OpenJDK)', monaco: 'java', ext: 'java' },
  { id: 'c', name: 'C (GCC 9.2)', monaco: 'c', ext: 'c' }
];

export const DEFAULT_TEMPLATES = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your code here

    return 0;
}
`,
  cpp20: `#include <iostream>
#include <vector>
#include <numeric>
#include <ranges>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your C++20 code here
    cout << "OA IDE - C++20" << "\\n";

    return 0;
}
`,
  python: `import sys

def main():
    # Read test cases from standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        print("Hello from OA IDE Python!")
        return

    # Process input here
    print(f"Total tokens read: {len(input_data)}")
    for i, token in enumerate(input_data):
        print(f"[{i}]: {token}")

if __name__ == '__main__':
    main()
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line != null) {
            System.out.println("Echo: " + line);
        } else {
            System.out.println("OA IDE Java 13/17");
        }
    }
}
`,
  c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        printf("Received: %d\\n", n);
    } else {
        printf("OA IDE - C Language\\n");
    }
    return 0;
}
`
};

/**
 * Fetch list of problems with optional difficulty and search filter
 */
export async function fetchProblems(difficulty = 'All', search = '') {
  try {
    const params = new URLSearchParams();
    if (difficulty && difficulty !== 'All') params.append('difficulty', difficulty);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/problems?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch problems');
    return await res.json();
  } catch (err) {
    console.error('Error fetching problems:', err);
    return { count: 0, problems: [] };
  }
}

/**
 * Fetch a single problem by id
 */
export async function fetchProblemById(id) {
  try {
    const res = await fetch(`${API_BASE}/problems/${id}`);
    if (!res.ok) throw new Error(`Failed to load problem ${id}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching problem details:', err);
    return null;
  }
}

/**
 * Run code against custom stdin test case
 */
export async function executeCode(sourceCode, language, input) {
  try {
    const response = await fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceCode,
        language,
        input: input || ''
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: data.status || 'error',
        stdout: data.stdout || '',
        stderr: data.stderr || `Execution Error (${response.status})`,
        compile_output: data.compile_output || '',
        time: data.time || '0.00',
        memory: data.memory || 0,
        exitCode: data.exitCode ?? 1,
        statusDescription: data.statusDescription || 'Execution Failed'
      };
    }

    return data;
  } catch (error) {
    return {
      status: 'error',
      stdout: '',
      stderr: `Network Error: ${error.message}. Verify backend server is running on port 5000.`,
      compile_output: '',
      time: '0.00',
      memory: 0,
      exitCode: 1,
      statusDescription: 'Connection Error'
    };
  }
}

/**
 * Submit code against hidden & sample test cases
 */
export async function submitCode(problemId, sourceCode, language) {
  try {
    const response = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId,
        sourceCode,
        language
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      verdict: 'Submission Error',
      error: error.message,
      passedTestCases: 0,
      totalTestCases: 0
    };
  }
}
