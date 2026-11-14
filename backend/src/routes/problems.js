import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read problems data
const problemsFilePath = path.resolve(__dirname, '../data/problems.json');

function loadProblems() {
  try {
    const rawData = fs.readFileSync(problemsFilePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to load problems.json:', err.message);
    return [];
  }
}

/**
 * GET /api/problems
 * Query params: ?difficulty=Easy|Medium|Hard&search=keyword
 */
router.get('/', (req, res) => {
  const problems = loadProblems();
  const { difficulty, search } = req.query;

  let filtered = problems.map(({ testCases, ...safeProblem }) => ({
    ...safeProblem,
    testCaseCount: testCases ? testCases.length : 0
  }));

  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(
      (p) => p.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({
    count: filtered.length,
    problems: filtered
  });
});

/**
 * GET /api/problems/:id
 * Returns single problem details
 */
router.get('/:id', (req, res) => {
  const problems = loadProblems();
  const problem = problems.find((p) => p.id === req.params.id);

  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  // Hide hidden test cases from public problem view
  const { testCases, ...safeProblem } = problem;
  res.json({
    ...safeProblem,
    testCaseCount: testCases ? testCases.length : 0
  });
});

export default router;
