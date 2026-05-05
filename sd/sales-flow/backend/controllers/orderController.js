const { Order } = require("../models");

exports.createOrder = async (req, res) => {
  try {
    const { customerName, customerRegion, product, quantity, price, total, status } = req.body;
    
    // Input validation
    if (!customerName || !customerRegion || !product) {
      return res.status(400).json({ message: "Customer name, region and product are required" });
    }
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    
    if (!price || price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }
    
    // Create items array from single product input
    const items = [
      {
        product: product.trim(),
        quantity: Number(quantity),
        price: Number(price),
        total: Number(quantity) * Number(price)
      }
    ];
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    const orderStatus = status && validStatuses.includes(status.toLowerCase()) 
      ? status.toLowerCase() 
      : 'pending';
    
    const orderData = {
      customerName: customerName.trim(),
      customerRegion: customerRegion.trim(),
      items: items, // Model setter will stringify this
      total: Number(total) || Number(quantity) * Number(price),
      status: orderStatus,
      userId: req.user?.id || null
    };
    
    console.log("Creating order with data:", orderData);
    
    const order = await Order.create(orderData);
    
    // Parse items back for response
    const response = order.toJSON();
    response.items = items;
    
    res.status(201).json(response);
  } catch (err) {
    console.error("Create order error:", err);
    
    // Handle specific Sequelize errors
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: messages 
      });
    }
    
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: "Database error. Please check your data and try again." 
      });
    }
    
    res.status(500).json({ 
      message: err.message || "Failed to create order" 
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      order: [["createdAt", "DESC"]]
    });
    
    // Parse items JSON string back to array for each order
    const parsedOrders = orders.map(order => {
      const orderData = order.toJSON();
      try {
        if (typeof orderData.items === 'string') {
          orderData.items = JSON.parse(orderData.items);
        }
      } catch (e) {
        console.error("Error parsing items for order:", order.id, e);
        orderData.items = [];
      }
      return orderData;
    });
    
    res.json(parsedOrders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch orders" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Parse items JSON string for single order
    const orderData = order.toJSON();
    try {
      if (typeof orderData.items === 'string') {
        orderData.items = JSON.parse(orderData.items);
      }
    } catch (e) {
      console.error("Error parsing items for order:", order.id, e);
      orderData.items = [];
    }
    
    res.json(orderData);
  } catch (err) {
    console.error("Get order by id error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch order" });
  }
};