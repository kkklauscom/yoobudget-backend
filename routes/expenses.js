import express from 'express';

const router = express.Router();

// TODO: Implement Fixed Expenses CRUD APIs
// POST /api/expenses - Create fixed expense
// GET /api/expenses - Get all fixed expenses
// GET /api/expenses/:id - Get single fixed expense
// PUT /api/expenses/:id - Update fixed expense
// DELETE /api/expenses/:id - Delete fixed expense

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Fixed Expenses API - Coming soon',
  });
});

export default router;

