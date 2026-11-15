import axios from 'axios';

// Judge0 Language ID Mapping
export const LANGUAGE_CONFIG = {
  cpp: {
    id: 54, // C++ (GCC 9.2.0)
    name: 'C++17 (GCC 9.2.0)',
    monaco: 'cpp',
    compilerOptions: '-std=c++17 -O2 -Wall',
    extension: 'cpp',
    defaultCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your code here

    return 0;
}
`
  },
  cpp20: {
    id: 54, // C++ (GCC 9.2.0 with -std=c++20) or 105
    fallbackId: 54,
    name: 'C++20',
    monaco: 'cpp',
    compilerOptions: '-std=c++20 -O2 -Wall',
    extension: 'cpp',
    defaultCode: `#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your C++20 code here
    cout << "OA IDE - C++20 Ready" << "\\n";

    return 0;
}
`
  },
  python: {
    id: 71, // Python (3.8.1)
    name: 'Python 3',
    monaco: 'python',
    extension: 'py',
    defaultCode: `import sys

def main():
    # Read input from standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        print("OA IDE - Python 3 Ready")
        return

    # Process test cases
    print(f"Read {len(input_data)} tokens:")
    for token in input_data:
        print(token)

if __name__ == '__main__':
    main()
`
  },
  java: {
    id: 62, // Java (OpenJDK 13.0.1)
    name: 'Java (OpenJDK)',
    monaco: 'java',
    extension: 'java',
    defaultCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line != null && !line.trim().isEmpty()) {
            System.out.println("Output: " + line);
        } else {
            System.out.println("OA IDE - Java Ready");
        }
    }
}
`
  },
  c: {
    id: 50, // C (GCC 9.2.0)
    name: 'C (GCC 9.2.0)',
    monaco: 'c',
    compilerOptions: '-O2 -Wall',
    extension: 'c',
    defaultCode: `#include <stdio.h>

int main() {
    printf("OA IDE - C Ready\\n");
    return 0;
}
`
  }
};

/**
 * Candidate Judge0 Endpoints with automatic failover and load distribution
 */
const JUDGE0_PUBLIC_ENDPOINTS = [
  'https://ce.judge0.com',
  'https://judge0-ce.p.rapidapi.com'
];

/**
 * Execute code via Judge0 API with high concurrency failover & automatic retry
 */
export async function executeCode({ sourceCode, language, input = '' }) {
  const langKey = language?.toLowerCase().trim();
  const config = LANGUAGE_CONFIG[langKey] || LANGUAGE_CONFIG['cpp'];

  const apiKey = process.env.JUDGE0_API_KEY ? process.env.JUDGE0_API_KEY.trim() : '';
  const apiHost = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

  // Base list of target endpoints
  const endpointsToTry = [];
  if (process.env.JUDGE0_API_URL) {
    endpointsToTry.push(process.env.JUDGE0_API_URL.trim());
  }
  if (apiKey) {
    endpointsToTry.push('https://judge0-ce.p.rapidapi.com');
  }
  endpointsToTry.push('https://ce.judge0.com');

  // De-duplicate endpoints
  const uniqueEndpoints = [...new Set(endpointsToTry.filter(Boolean))];

  // Base64 encode code and input to safely preserve whitespaces, special chars, and newlines
  const encodedSource = Buffer.from(sourceCode || '', 'utf-8').toString('base64');
  // Safe stdin: empty string encoded properly to guarantee execution without input
  const safeInput = typeof input === 'string' ? input : (input == null ? '' : String(input));
  const encodedStdin = Buffer.from(safeInput, 'utf-8').toString('base64');

  const submissionPayload = {
    source_code: encodedSource,
    language_id: config.id,
    stdin: encodedStdin,
    cpu_time_limit: parseFloat(process.env.EXECUTION_TIMEOUT || '5.0'),
    memory_limit: 128000 // 128 MB
  };

  if (config.compilerOptions) {
    submissionPayload.compiler_options = config.compilerOptions;
  }

  let lastError = null;

  // Try endpoints with automatic failover for high reliability
  for (const rawUrl of uniqueEndpoints) {
    const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    const isRapid = cleanUrl.includes('rapidapi');

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (isRapid && apiKey) {
      headers['x-rapidapi-key'] = apiKey;
      headers['x-rapidapi-host'] = apiHost;
    }

    try {
      const postUrl = `${cleanUrl}/submissions?base64_encoded=true&wait=true`;

      let response;
      try {
        response = await axios.post(postUrl, submissionPayload, {
          headers,
          timeout: 25000 // 25s timeout for high concurrent execution
        });
      } catch (postErr) {
        if (config.fallbackId && postErr.response?.data?.error?.includes('Language')) {
          submissionPayload.language_id = config.fallbackId;
          response = await axios.post(postUrl, submissionPayload, {
            headers,
            timeout: 25000
          });
        } else {
          throw postErr;
        }
      }

      let submission = response.data;

      // If Judge0 queued execution instead of immediate return (status 1 or 2)
      if (submission?.token && (submission.status?.id === 1 || submission.status?.id === 2)) {
        submission = await pollSubmission(cleanUrl, submission.token, headers);
      }

      return parseJudge0Result(submission);
    } catch (err) {
      lastError = err;
      // If error is 429 (rate limit) or 503 (service unavailable) or connection refused, try next endpoint
      const isRecoverable =
        err.response?.status === 429 ||
        err.response?.status >= 500 ||
        err.code === 'ECONNABORTED' ||
        err.code === 'ECONNREFUSED' ||
        err.code === 'ENOTFOUND';

      if (!isRecoverable && err.response?.status !== 401 && err.response?.status !== 403) {
        break; // Don't failover on client errors like 400
      }
    }
  }

  // If all attempts failed, throw informative error
  if (lastError?.response) {
    const status = lastError.response.status;
    const data = lastError.response.data;
    if (status === 429) {
      throw new Error('Code evaluation servers are experiencing heavy traffic. Please wait a moment and click Run again.');
    }
    throw new Error(`Judge0 API Error (${status}): ${typeof data === 'string' ? data : (data?.message || JSON.stringify(data))}`);
  } else if (lastError?.code === 'ECONNABORTED' || lastError?.message?.includes('timeout')) {
    throw new Error('Code execution timed out. The server was busy or your code has an infinite loop.');
  }

  throw lastError || new Error('Unable to contact code execution engines.');
}

/**
 * Poll submission token if wait=true didn't finish immediately
 */
async function pollSubmission(baseUrl, token, headers, maxRetries = 10, delayMs = 600) {
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const getUrl = `${cleanUrl}/submissions/${token}?base64_encoded=true`;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await new Promise((res) => setTimeout(res, delayMs));
    const res = await axios.get(getUrl, { headers, timeout: 8000 });
    const sub = res.data;
    // Status ID 1 = In Queue, 2 = Processing
    if (sub.status?.id !== 1 && sub.status?.id !== 2) {
      return sub;
    }
  }
  throw new Error('Code execution took too long in the queue. Please try again.');
}

/**
 * Safe base64 decoding helper
 */
function decodeBase64(str) {
  if (!str) return '';
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

/**
 * Format Judge0 response into standard OA IDE response
 */
function parseJudge0Result(sub) {
  const stdout = decodeBase64(sub.stdout);
  const stderr = decodeBase64(sub.stderr);
  const compileOutput = decodeBase64(sub.compile_output);
  const message = decodeBase64(sub.message);

  const statusId = sub.status?.id;
  const statusDesc = sub.status?.description || 'Unknown';

  let ideStatus = 'success';
  if (statusId === 6) {
    ideStatus = 'compilation_error';
  } else if (statusId === 5) {
    ideStatus = 'time_limit_exceeded';
  } else if (statusId >= 7 && statusId <= 12) {
    ideStatus = 'runtime_error';
  } else if (statusId !== 3) {
    ideStatus = 'error';
  }

  return {
    status: ideStatus,
    statusDescription: statusDesc,
    stdout: stdout || '',
    stderr: stderr || '',
    compile_output: compileOutput || '',
    message: message || '',
    time: sub.time ? `${parseFloat(sub.time).toFixed(3)}s` : '0.000s',
    memory: sub.memory ? `${sub.memory} KB` : 'N/A',
    exitCode: sub.exit_code ?? (ideStatus === 'success' ? 0 : 1),
    judge0StatusId: statusId
  };
}
