import express from 'express';

const router = express.Router();

// TODO: Implement Income CRUD APIs
// POST /api/income - Create income
// GET /api/income - Get all income records
// GET /api/income/:id - Get single income record
// PUT /api/income/:id - Update income record
// DELETE /api/income/:id - Delete income record

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Income API - Coming soon',
  });
});

export default router;


