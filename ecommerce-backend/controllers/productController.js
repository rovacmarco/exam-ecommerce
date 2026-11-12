const Product = require('../models/productSchema');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, sku, category, price, stock, description } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: 'Product name and price are required!' });
    }

    const generatedSku = sku && sku.trim()
      ? sku.trim().toUpperCase()
      : `SKU-${Date.now().toString().slice(-6)}`;

    const existing = await Product.findOne({ sku: generatedSku });
    if (existing) {
      return res.status(400).json({ error: 'A product with this SKU already exists!' });
    }

    const product = new Product({
      name: String(name).trim(),
      sku: generatedSku,
      category: category ? String(category).trim() : 'Electronics',
      price: Number(price),
      stock: Number(stock || 0),
      description: description ? String(description).trim() : ''
    });

    await product.save();
    res.status(201).json({ success: 'Product created successfully!', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, category, price, stock, description } = req.body;

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(sku !== undefined && { sku: String(sku).trim().toUpperCase() }),
        ...(category !== undefined && { category: String(category).trim() }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(description !== undefined && { description: String(description).trim() })
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Product not found!' });
    }

    res.status(200).json({ success: 'Product updated successfully!', product: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found!' });
    }
    res.status(200).json({ success: 'Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const seedDemoProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: 'Products already exist.', products });
    }

    const demoProducts = [
      { name: 'Pro Wireless Noise-Canceling Headphones', sku: 'AUDIO-101', category: 'Electronics', price: 249.99, stock: 42, salesCount: 128, description: 'Studio-grade ANC headphones with 40h battery life.' },
      { name: 'Minimalist Mechanical Keyboard', sku: 'TECH-204', category: 'Accessories', price: 139.00, stock: 18, salesCount: 94, description: 'Hot-swappable tactile switches with aluminum frame.' },
      { name: 'UltraSlim 4K USB-C Monitor 27"', sku: 'DISP-309', category: 'Electronics', price: 429.00, stock: 7, salesCount: 61, description: 'IPS panel with 99% sRGB color accuracy and 65W PD.' },
      { name: 'Ergonomic Mesh Office Chair', sku: 'FURN-412', category: 'Workspace', price: 319.50, stock: 15, salesCount: 47, description: 'Lumbar support with breathable mesh and 4D armrests.' },
      { name: 'Smart Fitness Watch Series 5', sku: 'WEAR-508', category: 'Wearables', price: 199.00, stock: 0, salesCount: 156, description: 'AMOLED display, GPS tracking, and heart-rate monitor.' }
    ];

    const products = await Product.insertMany(demoProducts);
    res.status(201).json({ success: 'Demo products seeded successfully!', products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, seedDemoProducts };
