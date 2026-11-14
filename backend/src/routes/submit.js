import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeCode, LANGUAGE_CONFIG } from '../services/judge0.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const problemsFilePath = path.resolve(__dirname, '../data/problems.json');

function loadProblems() {
  try {
    return JSON.parse(fs.readFileSync(problemsFilePath, 'utf-8'));
  } catch (err) {
    return [];
  }
}

/**
 * Normalizes output string for comparing competitive programming solutions
 * - Converts CRLF to LF
 * - Trims trailing whitespace on each line
 * - Trims overall leading and trailing whitespace
 */
function normalizeOutput(str) {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * POST /api/submit
 * Evaluates candidate code against problem's test cases
 */
router.post('/', async (req, res) => {
  try {
    const { problemId, sourceCode, language } = req.body;

    if (!problemId) {
      return res.status(400).json({ error: 'problemId is required' });
    }
    if (!sourceCode || typeof sourceCode !== 'string' || !sourceCode.trim()) {
      return res.status(400).json({ error: 'sourceCode is required' });
    }

    const langKey = (language || 'cpp').toLowerCase().trim();
    if (!LANGUAGE_CONFIG[langKey]) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const problems = loadProblems();
    const problem = problems.find((p) => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ error: `Problem ${problemId} not found` });
    }

    const testCases = problem.testCases || [];
    if (testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases configured for this problem.' });
    }

    let passedCount = 0;
    let maxTimeSeconds = 0;
    let maxMemoryKb = 0;
    const testCaseResults = [];
    let finalVerdict = 'Accepted';
    let failureDetail = null;

    // Test each testcase sequentially
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const caseNumber = i + 1;

      const runResult = await executeCode({
        sourceCode,
        language: langKey,
        input: tc.input
      });

      // 1. Compilation Error
      if (runResult.status === 'compilation_error') {
        return res.json({
          verdict: 'Compilation Error',
          statusDescription: 'Compilation Error',
          passedTestCases: 0,
          totalTestCases: testCases.length,
          time: '0.000s',
          memory: 'N/A',
          error: runResult.compile_output || runResult.stderr,
          testCaseResults: [
            { case: caseNumber, status: 'Compilation Error', passed: false }
          ]
        });
      }

      // 2. Time Limit Exceeded
      if (runResult.status === 'time_limit_exceeded') {
        finalVerdict = 'Time Limit Exceeded';
        testCaseResults.push({
          case: caseNumber,
          status: 'Time Limit Exceeded',
          passed: false,
          time: runResult.time
        });
        failureDetail = {
          caseNumber,
          message: 'Time Limit Exceeded on test case ' + caseNumber
        };
        break;
      }

      // 3. Runtime Error
      if (runResult.status === 'runtime_error' || (runResult.exitCode !== 0 && runResult.status !== 'success')) {
        finalVerdict = 'Runtime Error';
        testCaseResults.push({
          case: caseNumber,
          status: 'Runtime Error',
          passed: false,
          time: runResult.time,
          error: runResult.stderr || runResult.message
        });
        failureDetail = {
          caseNumber,
          message: `Runtime Error (SIG ${runResult.exitCode}) on testcase ${caseNumber}`,
          stderr: runResult.stderr
        };
        break;
      }

      // Track max execution metrics
      const timeVal = parseFloat(runResult.time) || 0;
      if (timeVal > maxTimeSeconds) maxTimeSeconds = timeVal;
      const memVal = parseInt(runResult.memory, 10) || 0;
      if (memVal > maxMemoryKb) maxMemoryKb = memVal;

      // Check output match
      const actualNorm = normalizeOutput(runResult.stdout);
      const expectedNorm = normalizeOutput(tc.expectedOutput);
      const isPassed = actualNorm === expectedNorm;

      if (isPassed) {
        passedCount++;
        testCaseResults.push({
          case: caseNumber,
          status: 'Passed',
          passed: true,
          time: runResult.time,
          memory: runResult.memory
        });
      } else {
        finalVerdict = 'Wrong Answer';
        testCaseResults.push({
          case: caseNumber,
          status: 'Wrong Answer',
          passed: false,
          time: runResult.time,
          memory: runResult.memory
        });

        failureDetail = {
          caseNumber,
          isHidden: tc.isHidden,
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : expectedNorm,
          actual: actualNorm
        };
        // Stop on first failure for fast competitive programming response
        break;
      }
    }

    return res.json({
      verdict: finalVerdict,
      passedTestCases: passedCount,
      totalTestCases: testCases.length,
      time: `${maxTimeSeconds.toFixed(3)}s`,
      memory: maxMemoryKb ? `${maxMemoryKb} KB` : 'N/A',
      testCaseResults,
      failureDetail
    });
  } catch (err) {
    console.error('Error during submit evaluation:', err);
    return res.status(500).json({
      verdict: 'Server Error',
      error: err.message || 'Submission evaluation encountered an error.',
      passedTestCases: 0,
      totalTestCases: 0
    });
  }
});

export default router;
