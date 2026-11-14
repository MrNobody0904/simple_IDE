import express from 'express';
import { executeCode, LANGUAGE_CONFIG } from '../services/judge0.js';

const router = express.Router();

const MAX_SOURCE_CODE_BYTES = 128 * 1024; // 128 KB
const MAX_INPUT_BYTES = 512 * 1024; // 512 KB

/**
 * GET /api/languages
 * Returns list of supported languages with templates and IDs
 */
router.get('/languages', (req, res) => {
  const languages = Object.keys(LANGUAGE_CONFIG).map((key) => ({
    key,
    name: LANGUAGE_CONFIG[key].name,
    monaco: LANGUAGE_CONFIG[key].monaco,
    defaultCode: LANGUAGE_CONFIG[key].defaultCode
  }));
  res.json({ languages });
});

/**
 * POST /api/run
 * Executes source code with custom standard input using Judge0
 */
router.post('/run', async (req, res) => {
  try {
    const { sourceCode, language, input = '' } = req.body;

    // 1. Validation: check source code
    if (typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        stdout: '',
        stderr: 'Validation Error: "sourceCode" is required and cannot be empty.',
        time: '0.00',
        memory: 0,
        exitCode: 1
      });
    }

    if (Buffer.byteLength(sourceCode, 'utf-8') > MAX_SOURCE_CODE_BYTES) {
      return res.status(413).json({
        status: 'error',
        stdout: '',
        stderr: `Source code exceeds maximum allowed size (${MAX_SOURCE_CODE_BYTES / 1024} KB).`,
        time: '0.00',
        memory: 0,
        exitCode: 1
      });
    }

    // 2. Validation: check language
    const langKey = (language || 'cpp').toLowerCase().trim();
    if (!LANGUAGE_CONFIG[langKey]) {
      const supported = Object.keys(LANGUAGE_CONFIG).join(', ');
      return res.status(400).json({
        status: 'error',
        stdout: '',
        stderr: `Unsupported language "${language}". Supported languages: ${supported}`,
        time: '0.00',
        memory: 0,
        exitCode: 1
      });
    }

    // 3. Validation: check input
    if (typeof input !== 'string') {
      return res.status(400).json({
        status: 'error',
        stdout: '',
        stderr: 'Validation Error: "input" must be a string.',
        time: '0.00',
        memory: 0,
        exitCode: 1
      });
    }

    if (Buffer.byteLength(input, 'utf-8') > MAX_INPUT_BYTES) {
      return res.status(413).json({
        status: 'error',
        stdout: '',
        stderr: `Custom input exceeds maximum allowed size (${MAX_INPUT_BYTES / 1024} KB).`,
        time: '0.00',
        memory: 0,
        exitCode: 1
      });
    }

    // 4. Delegate to isolated Judge0 sandbox
    const result = await executeCode({
      sourceCode,
      language: langKey,
      input
    });

    // 5. Return standardized response matching the exact spec
    return res.json({
      status: result.status,
      statusDescription: result.statusDescription,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      message: result.message,
      time: result.time,
      memory: result.memory,
      exitCode: result.exitCode
    });
  } catch (err) {
    console.error('Error running code:', err.message);
    return res.status(500).json({
      status: 'error',
      stdout: '',
      stderr: err.message || 'Internal Execution Error',
      compile_output: '',
      time: '0.00',
      memory: 0,
      exitCode: 1
    });
  }
});

export default router;
