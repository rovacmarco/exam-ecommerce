const Order = require('../models/orderSchema');

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, items, totalAmount, paymentMethod, status } = req.body;

    if (!customerName || !customerEmail) {
      return res.status(400).json({ error: 'Customer name and email are required!' });
    }

    const orderItems = Array.isArray(items) && items.length > 0
      ? items
      : [{ name: 'Store Order Item', qty: 1, price: Number(totalAmount || 0) }];

    const computedTotal = totalAmount !== undefined
      ? Number(totalAmount)
      : orderItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = new Order({
      orderNumber,
      customerName: String(customerName).trim(),
      customerEmail: String(customerEmail).trim().toLowerCase(),
      items: orderItems,
      totalAmount: computedTotal,
      paymentMethod: paymentMethod || 'Card',
      status: status || 'Pending'
    });

    await order.save();
    res.status(201).json({ success: 'Order created successfully!', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status!' });
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Order not found!' });
    }

    res.status(200).json({ success: 'Order status updated!', order: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Order not found!' });
    }
    res.status(200).json({ success: 'Order deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const seedDemoOrders = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    if (count > 0) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: 'Orders already exist.', orders });
    }

    const demoOrders = [
      {
        orderNumber: 'ORD-849201',
        customerName: 'Amina Rahman',
        customerEmail: 'amina.rahman@example.com',
        items: [{ name: 'Pro Wireless Noise-Canceling Headphones', qty: 1, price: 249.99 }],
        totalAmount: 249.99,
        status: 'Delivered',
        paymentMethod: 'Card'
      },
      {
        orderNumber: 'ORD-849202',
        customerName: 'Tariq Hasan',
        customerEmail: 'tariq.hasan@example.com',
        items: [{ name: 'UltraSlim 4K USB-C Monitor 27"', qty: 1, price: 429.00 }],
        totalAmount: 429.00,
        status: 'Shipped',
        paymentMethod: 'Stripe'
      },
      {
        orderNumber: 'ORD-849203',
        customerName: 'Nadia Karim',
        customerEmail: 'nadia.karim@example.com',
        items: [{ name: 'Minimalist Mechanical Keyboard', qty: 2, price: 139.00 }],
        totalAmount: 278.00,
        status: 'Processing',
        paymentMethod: 'PayPal'
      },
      {
        orderNumber: 'ORD-849204',
        customerName: 'Rafiq Ahmed',
        customerEmail: 'rafiq.ahmed@example.com',
        items: [{ name: 'Ergonomic Mesh Office Chair', qty: 1, price: 319.50 }],
        totalAmount: 319.50,
        status: 'Pending',
        paymentMethod: 'COD'
      }
    ];

    const orders = await Order.insertMany(demoOrders);
    res.status(201).json({ success: 'Demo orders seeded successfully!', orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getOrders, createOrder, updateOrderStatus, deleteOrder, seedDemoOrders };
