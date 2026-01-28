const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.get('/metrics', async (req, res) => {
  try {
    
    const [[putawayRow]] = await db.execute(
      `SELECT AVG(TIMESTAMPDIFF(MINUTE, received_date, putaway_date)) AS avg_putaway_time
       FROM grn
       WHERE status = 'complete'
         AND putaway_date IS NOT NULL`
    );

    
    const [[totalGrnsRow]] = await db.execute(
      `SELECT COUNT(*) AS total_grns FROM grn`
    );

    
    let pickAccuracy = 100;
    try {
      const [[pickRow]] = await db.execute(
        `SELECT 
           (SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS pick_accuracy
         FROM picks`
      );
      pickAccuracy = pickRow.pick_accuracy || 0;
    } catch {
      
      pickAccuracy = 100;
    }

    const [[accRow]] = await db.execute(`
  SELECT 
    (1 - (SUM(ABS(variance)) / NULLIF(SUM(system_qty), 0))) * 100 AS inventory_accuracy
  FROM cycle_count_results ccr
  JOIN cycle_counts cc ON cc.id = ccr.cycle_count_id
  WHERE cc.scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
`);

let inventoryAccuracy = 0;
if (accRow && accRow.inventory_accuracy !== null) {
  inventoryAccuracy = accRow.inventory_accuracy;
}


    res.json({
      avg_putaway_time: putawayRow?.avg_putaway_time || 0,
      pick_accuracy: pickAccuracy,
      total_grns: totalGrnsRow?.total_grns || 0
    });
  } catch (err) {
    console.error('Metrics error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
