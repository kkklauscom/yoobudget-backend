import express from 'express';

const router = express.Router();

// TODO: Implement Budget Ratio Settings API
// GET /api/budget/ratios - Get budget ratio settings
// PUT /api/budget/ratios - Update budget ratio settings

router.get('/ratios', (req, res) => {
  res.json({
    success: true,
    message: 'Budget Ratio Settings API - Coming soon',
  });
});

export default router;

