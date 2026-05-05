const db = require('../config/db');

exports.getRequirements = async (req, res) => {
  try {
    const { date } = req.query;
    const [rows] = await db.query(
      'SELECT m.*, p.code as product_code, p.name as product_name, mat.code as material_code, mat.name as material_name FROM mrp_requirements m LEFT JOIN products p ON m.product_id = p.id LEFT JOIN materials mat ON m.material_id = mat.id WHERE m.need_date = ? ORDER BY m.id',
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /mrp', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.run = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { date } = req.body;
    
    await connection.beginTransaction();
    
    // 1. Get production plan for the date
    const [planRows] = await connection.query(
      'SELECT * FROM production_plan WHERE plan_date = ?',
      [date]
    );
    
    if (planRows.length === 0) {
      await connection.commit();
      return res.json({ 
        message: 'No production plan found for this date',
        inserted: 0,
        planLines: 0
      });
    }
    
    // 2. Delete existing MRP requirements for this date
    await connection.query('DELETE FROM mrp_requirements WHERE need_date = ?', [date]);
    
    let insertedCount = 0;
    
    // 3. For each production plan line, find BOM and calculate material requirements
    for (const plan of planRows) {
      // Get BOM for this product (and grade_pack if available)
      let bomRows;
      if (plan.grade_pack_id) {
        [bomRows] = await connection.query(
          'SELECT * FROM bom WHERE product_id = ? AND grade_pack_id = ?',
          [plan.product_id, plan.grade_pack_id]
        );
      }
      
      // If no grade-specific BOM, get general BOM
      if (!bomRows || bomRows.length === 0) {
        [bomRows] = await connection.query(
          'SELECT * FROM bom WHERE product_id = ?',
          [plan.product_id]
        );
      }
      
      if (bomRows.length === 0) {
        // No BOM for this product - skip
        continue;
      }
      
      // 4. For each BOM line, calculate material requirement
      for (const bom of bomRows) {
        const requiredQty = parseFloat(plan.planned_qty) * parseFloat(bom.qty_per_unit || 1);
        
        await connection.query(
          'INSERT INTO mrp_requirements (need_date, product_id, grade_pack_id, material_id, required_qty, status) VALUES (?, ?, ?, ?, ?, ?)',
          [date, plan.product_id, plan.grade_pack_id, bom.material_id, requiredQty, 'open']
        );
        
        insertedCount++;
      }
    }
    
    await connection.commit();
    
    res.json({
      message: `Generated ${insertedCount} material requirements from ${planRows.length} production plan lines`,
      inserted: insertedCount,
      planLines: planRows.length
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('POST /mrp/run', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  } finally {
    connection.release();
  }
};