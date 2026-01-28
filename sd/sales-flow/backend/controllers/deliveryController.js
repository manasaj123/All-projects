const { Delivery, Order } = require("../models");

exports.createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.status(201).json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Not found" });

    delivery.status = req.body.status;
    delivery.deliveredAt = req.body.deliveredAt || delivery.deliveredAt;
    await delivery.save();

    if (delivery.status === "DELIVERED") {
      const order = await Order.findByPk(delivery.orderId);
      if (order) {
        order.status = "DELIVERED";
        await order.save();
      }
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({ include: Order });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
