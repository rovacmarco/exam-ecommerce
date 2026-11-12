'use client';

import { useState } from 'react';
import { IconX } from './Icons';

export default function OrderModal({ isOpen, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    itemName: 'Pro Wireless Headphones',
    qty: '1',
    price: '249.99',
    paymentMethod: 'Card',
    status: 'Pending',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Math.max(1, Number(form.qty || 1));
    const price = Math.max(0, Number(form.price || 0));
    onSave({
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      items: [{ name: form.itemName, qty, price }],
      totalAmount: Number((qty * price).toFixed(2)),
      paymentMethod: form.paymentMethod,
      status: form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Create Customer Order</h3>
            <p className="text-xs text-slate-400">Record a new order in MongoDB</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Customer Name *</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Customer Email *</label>
              <input
                type="email"
                required
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Item Name *</label>
            <input
              type="text"
              required
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Qty</label>
              <input
                type="number"
                min="1"
                required
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Card">Card</option>
                <option value="Stripe">Stripe</option>
                <option value="PayPal">PayPal</option>
                <option value="COD">COD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Calculated Total</span>
            <span className="text-base font-bold text-emerald-400">
              ${((Number(form.qty || 0) * Number(form.price || 0)) || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
