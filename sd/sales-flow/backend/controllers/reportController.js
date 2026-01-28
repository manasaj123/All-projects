const { sequelize, Order } = require("../models");
const { QueryTypes } = require("sequelize");

exports.salesByCustomer = async (req, res) => {
  try {
    // Using raw query on JSON column
    const data = await sequelize.query(
      `
      SELECT customerName AS customer,
             SUM(JSON_EXTRACT(items, '$[*].quantity') * JSON_EXTRACT(items, '$[*].price')) AS totalSales
      FROM orders
      GROUP BY customerName
      `,
      { type: QueryTypes.SELECT }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// simpler: compute in JS if JSON functions are tricky in your MySQL version
exports.salesByRegion = async (req, res) => {
  try {
    const orders = await Order.findAll();
    const map = {};
    orders.forEach((o) => {
      const region = o.customerRegion;
      const items = o.items || [];
      const amount = items.reduce(
        (sum, it) => sum + it.quantity * it.price,
        0
      );
      map[region] = (map[region] || 0) + amount;
    });
    const result = Object.entries(map).map(([region, totalSales]) => ({
      region,
      totalSales
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
