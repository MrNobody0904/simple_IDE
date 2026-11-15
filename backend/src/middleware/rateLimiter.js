import rateLimit from 'express-rate-limit';

// High capacity limiter to handle concurrent requests seamlessly
export const runLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Increased to support heavy concurrency and active coding sessions
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    stdout: '',
    stderr: 'Server is currently experiencing high load. Please wait a few seconds before running code again.',
    time: '0.00',
    memory: 0,
    exitCode: 1
  }
});

export const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Increased capacity for multiple concurrent submissions
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    verdict: 'Rate Limited',
    error: 'Too many submissions in a short period. Please wait a moment before submitting again.',
    passedTestCases: 0,
    totalTestCases: 0
  }
});
