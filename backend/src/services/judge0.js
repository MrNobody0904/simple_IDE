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
 * Execute code via Judge0 API
 */
export async function executeCode({ sourceCode, language, input = '' }) {
  const langKey = language?.toLowerCase().trim();
  const config = LANGUAGE_CONFIG[langKey] || LANGUAGE_CONFIG['cpp'];

  const apiKey = process.env.JUDGE0_API_KEY ? process.env.JUDGE0_API_KEY.trim() : '';
  const apiHost = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

  // Smart endpoint selection:
  // If user provided a RapidAPI key, default to RapidAPI CE endpoint.
  // If no key is provided, default to public Judge0 CE endpoint (https://ce.judge0.com)
  let judge0Url = process.env.JUDGE0_API_URL;
  if (!judge0Url) {
    judge0Url = apiKey ? 'https://judge0-ce.p.rapidapi.com' : 'https://ce.judge0.com';
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // If using RapidAPI
  if (apiKey) {
    headers['x-rapidapi-key'] = apiKey;
    headers['x-rapidapi-host'] = apiHost;
  }

  // Base64 encode code and input to safely preserve whitespaces, special chars, and newlines
  const encodedSource = Buffer.from(sourceCode, 'utf-8').toString('base64');
  const encodedStdin = Buffer.from(input || '', 'utf-8').toString('base64');

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

  try {
    // Request execution with wait=true for fast synchronous turnaround
    const cleanUrl = judge0Url.endsWith('/') ? judge0Url.slice(0, -1) : judge0Url;
    const postUrl = `${cleanUrl}/submissions?base64_encoded=true&wait=true`;

    let response;
    try {
      response = await axios.post(postUrl, submissionPayload, {
        headers,
        timeout: 20000 // 20s HTTP timeout
      });
    } catch (postErr) {
      // Fallback check if language ID was invalid on specific Judge0 instances
      if (config.fallbackId && postErr.response?.data?.error?.includes('Language')) {
        submissionPayload.language_id = config.fallbackId;
        response = await axios.post(postUrl, submissionPayload, {
          headers,
          timeout: 20000
        });
      } else {
        throw postErr;
      }
    }

    let submission = response.data;

    // If Judge0 returned a token without waiting (or status is processing: 1 or 2)
    if (submission?.token && (submission.status?.id === 1 || submission.status?.id === 2)) {
      submission = await pollSubmission(judge0Url, submission.token, headers);
    }

    return parseJudge0Result(submission);
  } catch (error) {
    // Graceful error classification
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle common Judge0 / RapidAPI error conditions
      if (status === 401 || status === 403) {
        throw new Error(
          `Judge0 API Authentication Failed (${status}): ${data?.message || 'Invalid or missing API Key'}. Please check JUDGE0_API_KEY in backend .env.`
        );
      }
      if (status === 429) {
        throw new Error('Judge0 API rate limit reached. Please wait a few seconds before submitting again.');
      }
      throw new Error(`Judge0 API error (${status}): ${JSON.stringify(data)}`);
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Execution timed out while waiting for Judge0 server.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error(`Unable to connect to Judge0 at ${judge0Url}. Please ensure network connection or update JUDGE0_API_URL.`);
    }

    throw error;
  }
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
