import rateLimit from 'express-rate-limit';

export const runLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    stdout: '',
    stderr: 'Rate limit exceeded: Please wait a moment before running more code.',
    time: '0.00',
    memory: 0,
    exitCode: 1
  }
});

export const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    verdict: 'Rate Limited',
    error: 'Too many submissions in a short period. Please wait 1 minute before submitting again.',
    passedTestCases: 0,
    totalTestCases: 0
  }
});
