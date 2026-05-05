const db = require('../config/db');

exports.daily = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Get work orders for the date
    const [workOrders] = await db.query(
      'SELECT * FROM work_orders WHERE plan_date = ?',
      [date]
    );
    
    // Calculate metrics
    let totalPlanned = 0;
    let totalActual = 0;
    let totalWastage = 0;
    
    workOrders.forEach(wo => {
      totalPlanned += parseFloat(wo.planned_qty || 0);
      totalActual += parseFloat(wo.actual_qty || 0);
      totalWastage += parseFloat(wo.wastage_qty || 0);
    });
    
    // Calculate yield percentage
    const yieldPercent = totalPlanned > 0 
      ? ((totalActual / totalPlanned) * 100).toFixed(2)
      : 0;
    
    // Calculate efficiency
    const efficiency = totalPlanned > 0
      ? (((totalActual - totalWastage) / totalPlanned) * 100).toFixed(2)
      : 0;
    
    // Get production plan summary
    const [planSummary] = await db.query(
      'SELECT COUNT(*) as total_lines, SUM(planned_qty) as total_planned_qty FROM production_plan WHERE plan_date = ?',
      [date]
    );
    
    // Get capacity summary
    const [capacitySummary] = await db.query(
      'SELECT COUNT(*) as total_lines, SUM(available_hours) as total_hours FROM capacity_plan WHERE plan_date = ?',
      [date]
    );
    
    res.json({
      date: date,
      total_planned: totalPlanned,
      total_actual: totalActual,
      total_wastage: totalWastage,
      yield_percent: parseFloat(yieldPercent),
      efficiency_percent: parseFloat(efficiency),
      work_orders_count: workOrders.length,
      completed_orders: workOrders.filter(wo => wo.status === 'completed').length,
      open_orders: workOrders.filter(wo => wo.status === 'open').length,
      in_progress_orders: workOrders.filter(wo => wo.status === 'in_progress').length,
      plan_lines: planSummary[0]?.total_lines || 0,
      plan_total_qty: planSummary[0]?.total_planned_qty || 0,
      capacity_lines: capacitySummary[0]?.total_lines || 0,
      capacity_total_hours: capacitySummary[0]?.total_hours || 0
    });
    
  } catch (err) {
    console.error('GET /metrics/daily', err);
    res.status(500).json({ error: 'Server error' });
  }
};