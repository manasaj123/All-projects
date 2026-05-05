const db = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    
    // Validate Code - only alphanumeric (letters and numbers), no special characters
    const codeRegex = /^[a-zA-Z0-9]+$/;
    if (!codeRegex.test(code)) {
      return res.status(400).json({ 
        error: 'Code must contain only letters and numbers (no special characters)' 
      });
    }
    
    // Validate Name - only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ 
        error: 'Name must contain only letters and spaces' 
      });
    }
    
    // Check for duplicate code
    const [existing] = await db.query('SELECT id FROM products WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Product with this code already exists' });
    }
    
    const [result] = await db.query(
      'INSERT INTO products (code, name) VALUES (?, ?)',
      [code, name]
    );
    
    const row = { 
      id: result.insertId, 
      code, 
      name 
    };
    
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;
    
    // Validate Code - only alphanumeric (letters and numbers), no special characters
    const codeRegex = /^[a-zA-Z0-9]+$/;
    if (!codeRegex.test(code)) {
      return res.status(400).json({ 
        error: 'Code must contain only letters and numbers (no special characters)' 
      });
    }
    
    // Validate Name - only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ 
        error: 'Name must contain only letters and spaces' 
      });
    }
    
    // Check if product exists
    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check for duplicate code (excluding current product)
    const [duplicate] = await db.query(
      'SELECT id FROM products WHERE code = ? AND id != ?', 
      [code, id]
    );
    if (duplicate.length > 0) {
      return res.status(400).json({ error: 'Product with this code already exists' });
    }
    
    await db.query(
      'UPDATE products SET code = ?, name = ? WHERE id = ?',
      [code, name, id]
    );
    
    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Product deleted successfully',
      deletedProduct: product[0]
    });
  } catch (err) {
    next(err);
  }
};