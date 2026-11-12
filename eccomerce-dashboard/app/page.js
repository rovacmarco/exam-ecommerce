'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiRequest, API_BASE, API_KEY, getSession, clearSession } from '../lib/api';
import RevenueChart from '../components/RevenueChart';
import ProductModal from '../components/ProductModal';
import OrderModal from '../components/OrderModal';
import {
  IconStore,
  IconDashboard,
  IconPackage,
  IconCart,
  IconUsers,
  IconTerminal,
  IconDollar,
  IconSearch,
  IconPlus,
  IconTrash,
  IconEdit,
  IconRefresh,
  IconShield,
  IconLogout,
  IconMenu,
  IconX,
  IconCheck,
} from '../components/Icons';

const STATUS_BADGES = {
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Processing: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Shipped: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const API_PRESETS = [
  { label: 'Health Check', method: 'GET', path: '/api/health', useKey: false, body: '' },
  { label: 'Get Overview Stats', method: 'GET', path: '/api/stats', useKey: false, body: '' },
  { label: 'List Products', method: 'GET', path: '/api/products', useKey: false, body: '' },
  { label: 'List Orders', method: 'GET', path: '/api/orders', useKey: false, body: '' },
  { label: 'List Users', method: 'GET', path: '/api/users', useKey: false, body: '' },
  {
    label: 'Register User (with API Key)',
    method: 'POST',
    path: '/api/auth/register',
    useKey: true,
    body: JSON.stringify({ name: 'Demo Customer', email: 'demo@example.com', password: 'password123' }, null, 2),
  },
  {
    label: 'Login User',
    method: 'POST',
    path: '/api/auth/login',
    useKey: false,
    body: JSON.stringify({ email: 'demo@example.com', password: 'password123' }, null, 2),
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [sessionUser, setSessionUser] = useState(null);
  const [health, setHealth] = useState({ status: 'checking', database: 'checking' });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    verifiedUsers: 0,
    lowStockCount: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // API Console State
  const [consoleMethod, setConsoleMethod] = useState('GET');
  const [consolePath, setConsolePath] = useState('/api/health');
  const [consoleUseKey, setConsoleUseKey] = useState(false);
  const [consoleBody, setConsoleBody] = useState('');
  const [consoleResponse, setConsoleResponse] = useState(null);
  const [consoleLoading, setConsoleLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [healthRes, statsRes, productsRes, ordersRes, usersRes] = await Promise.allSettled([
        apiRequest('/api/health'),
        apiRequest('/api/stats'),
        apiRequest('/api/products'),
        apiRequest('/api/orders'),
        apiRequest('/api/users'),
      ]);

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      } else {
        setHealth({ status: 'offline', database: 'disconnected' });
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
        setStats(statsRes.value.stats);
      }
      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value?.products)) {
        setProducts(productsRes.value.products);
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value?.orders)) {
        setOrders(ordersRes.value.orders);
      }
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value?.users)) {
        setUsers(usersRes.value.users);
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    setSessionUser(getSession());
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    clearSession();
    setSessionUser(null);
    showToast('Signed out of session.');
  };

  // Product Handlers
  const handleSaveProduct = async (formData) => {
    setActionLoading(true);
    try {
      if (editingProduct) {
        const res = await apiRequest(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          body: formData,
        });
        showToast(res.success || 'Product updated!');
      } else {
        const res = await apiRequest('/api/products', {
          method: 'POST',
          body: formData,
        });
        showToast(res.success || 'Product created!');
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
      showToast(res.success || 'Product removed.');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSeedProducts = async () => {
    setActionLoading(true);
    try {
      const res = await apiRequest('/api/products/seed', { method: 'POST' });
      showToast(res.success || 'Demo products loaded!');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Order Handlers
  const handleCreateOrder = async (orderPayload) => {
    setActionLoading(true);
    try {
      const res = await apiRequest('/api/orders', {
        method: 'POST',
        body: orderPayload,
      });
      showToast(res.success || 'Order created!');
      setOrderModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const res = await apiRequest(`/api/orders/${id}`, {
        method: 'PATCH',
        body: { status },
      });
      showToast(res.success || 'Order status updated!');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      const res = await apiRequest(`/api/orders/${id}`, { method: 'DELETE' });
      showToast(res.success || 'Order deleted.');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSeedOrders = async () => {
    setActionLoading(true);
    try {
      const res = await apiRequest('/api/orders/seed', { method: 'POST' });
      showToast(res.success || 'Demo orders loaded!');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // User Handlers
  const handleToggleVerifyUser = async (id) => {
    try {
      const res = await apiRequest(`/api/users/${id}/verify`, { method: 'PATCH' });
      showToast(res.success || 'Verification status toggled!');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await apiRequest(`/api/users/${id}`, { method: 'DELETE' });
      showToast(res.success || 'User removed.');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // API Console Handler
  const handleRunApiConsole = async (e) => {
    e.preventDefault();
    setConsoleLoading(true);
    setConsoleResponse(null);
    const start = performance.now();
    try {
      let parsedBody = null;
      if (consoleMethod !== 'GET' && consoleBody.trim()) {
        parsedBody = JSON.parse(consoleBody);
      }
      const data = await apiRequest(consolePath, {
        method: consoleMethod,
        body: parsedBody,
        useApiKey: consoleUseKey,
      });
      setConsoleResponse({
        ok: true,
        timeMs: Math.round(performance.now() - start),
        data,
      });
    } catch (err) {
      setConsoleResponse({
        ok: false,
        timeMs: Math.round(performance.now() - start),
        data: { error: err.message },
      });
    } finally {
      setConsoleLoading(false);
    }
  };

  // Filtered collections
  const q = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter(
    (o) =>
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.customerEmail?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
  );

  const filteredUsers = users.filter(
    (u) => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  );

  const productCategories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: IconDashboard },
    { id: 'products', label: 'Products', icon: IconPackage, badge: products.length },
    { id: 'orders', label: 'Orders', icon: IconCart, badge: orders.length },
    { id: 'customers', label: 'Customers', icon: IconUsers, badge: users.length },
    { id: 'api', label: 'API Console', icon: IconTerminal },
  ];

  const isBackendOnline = health.status === 'ok';
  const isDbConnected = health.database === 'connected';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl transition ${
            toast.type === 'error'
              ? 'border-rose-500/40 bg-rose-950/90 text-rose-200'
              : 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200'
          }`}
        >
          {toast.type !== 'error' && <IconCheck className="w-4 h-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-68 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <IconStore className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">NovaCommerce</h1>
                <p className="text-[11px] text-slate-400">Admin Dashboard</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <IconX />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Auth Pages
              </p>
              <Link
                href="/login"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
              >
                <IconShield className="w-4 h-4" />
                Login & Recovery
              </Link>
              <Link
                href="/register"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
              >
                <IconUsers className="w-4 h-4" />
                Register & OTP
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom User / Connection Card */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-3">
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Backend API</span>
              <span className={`font-semibold ${isBackendOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBackendOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-slate-400">MongoDB</span>
              <span className={`font-semibold ${isDbConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isDbConnected ? 'Connected' : health.database}
              </span>
            </div>
          </div>

          {sessionUser ? (
            <div className="flex items-center justify-between gap-2 px-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{sessionUser.name || 'Admin'}</p>
                <p className="text-[11px] text-slate-400 truncate">{sessionUser.email || 'Authenticated'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
              >
                <IconLogout />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Sign In as Admin
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900"
            >
              <IconMenu />
            </button>

            <div className="relative flex-1">
              <IconSearch className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, orders, customers..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/80 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-300">
                {isBackendOnline ? 'Port 8000 Connected' : 'Backend Offline'}
              </span>
            </div>

            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loadingData}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Refresh data"
            >
              <IconRefresh className={loadingData ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
            >
              <IconPlus />
              Add Product
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Backend Offline Warning Banner */}
          {!loadingData && !isBackendOnline && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-amber-300">
                  Backend server not detected at {API_BASE}
                </h4>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Start your backend in <code className="font-mono">ecommerce-backend</code> with{' '}
                  <code className="font-mono bg-amber-950/60 px-1.5 py-0.5 rounded">npm start</code> to load live MongoDB data.
                </p>
              </div>
              <button
                type="button"
                onClick={loadDashboardData}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold text-amber-200 border border-amber-500/30 self-start sm:self-auto"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Hero */}
              <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 sm:p-7">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                      Store Operations Live
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-tight">
                      Welcome back{sessionUser?.name ? `, ${sessionUser.name}` : ', Admin'}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 max-w-xl">
                      Monitor real-time orders, inventory levels, verified customer accounts, and backend API performance from one unified console.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
                    >
                      <IconPlus /> New Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
                    >
                      <IconCart className="w-4 h-4" /> New Order
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Live Revenue</span>
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <IconDollar className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mt-3 tabular-nums">
                    ${Number(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-emerald-400 mt-1.5">From active non-cancelled orders</p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Total Orders</span>
                    <span className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                      <IconCart className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mt-3 tabular-nums">{stats.totalOrders}</div>
                  <p className="text-xs text-slate-400 mt-1.5">Click Orders tab to manage fulfillment</p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Catalog Products</span>
                    <span className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                      <IconPackage className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mt-3 tabular-nums">{stats.totalProducts}</div>
                  <p className="text-xs text-amber-400 mt-1.5">
                    {stats.lowStockCount} item(s) low or out of stock
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Registered Users</span>
                    <span className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                      <IconUsers className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mt-3 tabular-nums">{stats.totalUsers}</div>
                  <p className="text-xs text-emerald-400 mt-1.5">
                    {stats.verifiedUsers} email-verified accounts
                  </p>
                </div>
              </div>

              {/* Chart + Quick Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart liveRevenue={stats.totalRevenue} />
                </div>

                {/* Quick Seed & Store Health Panel */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 flex flex-col justify-between space-y-5">
                  <div>
                    <h3 className="text-base font-semibold text-white">Quick Store Setup</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Populate sample MongoDB inventory & orders or inspect low-stock alerts.
                    </p>

                    <div className="mt-4 space-y-2.5">
                      <button
                        type="button"
                        onClick={handleSeedProducts}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/70 hover:border-indigo-500/50 text-xs font-medium text-slate-200 transition"
                      >
                        <span>Seed Demo Products</span>
                        <span className="text-indigo-400 font-semibold">+5 items</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSeedOrders}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/70 hover:border-indigo-500/50 text-xs font-medium text-slate-200 transition"
                      >
                        <span>Seed Demo Orders</span>
                        <span className="text-cyan-400 font-semibold">+4 orders</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Low Stock Alerts
                    </h4>
                    {products.filter((p) => p.stock <= 10).length === 0 ? (
                      <p className="text-xs text-slate-500">All products are well stocked.</p>
                    ) : (
                      <div className="space-y-2">
                        {products
                          .filter((p) => p.stock <= 10)
                          .slice(0, 3)
                          .map((p) => (
                            <div
                              key={p._id}
                              className="flex items-center justify-between text-xs rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2"
                            >
                              <span className="text-slate-200 truncate pr-2">{p.name}</span>
                              <span
                                className={`font-semibold shrink-0 ${
                                  p.stock === 0 ? 'text-rose-400' : 'text-amber-400'
                                }`}
                              >
                                {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">Recent Orders</h3>
                    <p className="text-xs text-slate-400">Latest transactions recorded in MongoDB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    View all →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No orders yet. Click <button type="button" onClick={handleSeedOrders} className="text-indigo-400 underline">Seed Demo Orders</button> or create a new order.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950/60 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-6 py-3">Order</th>
                          <th className="px-6 py-3">Customer</th>
                          <th className="px-6 py-3">Total</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order._id} className="hover:bg-slate-800/30 transition">
                            <td className="px-6 py-3.5 font-mono text-xs text-indigo-300">{order.orderNumber}</td>
                            <td className="px-6 py-3.5">
                              <div className="font-medium text-white">{order.customerName}</div>
                              <div className="text-xs text-slate-400">{order.customerEmail}</div>
                            </td>
                            <td className="px-6 py-3.5 font-semibold text-white tabular-nums">
                              ${Number(order.totalAmount || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  STATUS_BADGES[order.status] || STATUS_BADGES.Pending
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Product Inventory</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Create, update, and manage catalog items stored in MongoDB.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {products.length === 0 && (
                    <button
                      type="button"
                      onClick={handleSeedProducts}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
                    >
                      Seed Demo Products
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
                  >
                    <IconPlus /> Add Product
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 overflow-hidden">
                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm text-slate-400">No matching products found.</p>
                    <button
                      type="button"
                      onClick={handleSeedProducts}
                      className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                    >
                      Load Demo Products
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950/70 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-6 py-3.5">Product</th>
                          <th className="px-6 py-3.5">SKU</th>
                          <th className="px-6 py-3.5">Category</th>
                          <th className="px-6 py-3.5">Price</th>
                          <th className="px-6 py-3.5">Stock</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {filteredProducts.map((product) => {
                          const stockStatus =
                            product.stock === 0
                              ? { label: 'Out of Stock', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
                              : product.stock <= 10
                              ? { label: `Low (${product.stock})`, cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
                              : { label: `In Stock (${product.stock})`, cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };

                          return (
                            <tr key={product._id} className="hover:bg-slate-800/30 transition">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{product.name}</div>
                                {product.description && (
                                  <div className="text-xs text-slate-400 truncate max-w-xs">{product.description}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-300">{product.sku}</td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-white tabular-nums">
                                ${Number(product.price || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${stockStatus.cls}`}>
                                  {stockStatus.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductModalOpen(true);
                                  }}
                                  className="inline-flex p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                                  title="Edit product"
                                >
                                  <IconEdit />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(product._id)}
                                  className="inline-flex p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                  title="Delete product"
                                >
                                  <IconTrash />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Order Fulfillment</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track customer orders and update live fulfillment statuses.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  {orders.length === 0 && (
                    <button
                      type="button"
                      onClick={handleSeedOrders}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
                    >
                      Seed Demo Orders
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
                  >
                    <IconPlus /> Create Order
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm text-slate-400">No orders found.</p>
                    <button
                      type="button"
                      onClick={handleSeedOrders}
                      className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                    >
                      Load Demo Orders
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950/70 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-6 py-3.5">Order ID</th>
                          <th className="px-6 py-3.5">Customer</th>
                          <th className="px-6 py-3.5">Items</th>
                          <th className="px-6 py-3.5">Payment</th>
                          <th className="px-6 py-3.5">Total</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {filteredOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-slate-800/30 transition">
                            <td className="px-6 py-4 font-mono text-xs text-indigo-300">{order.orderNumber}</td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">{order.customerName}</div>
                              <div className="text-xs text-slate-400">{order.customerEmail}</div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-300">
                              {order.items?.[0]?.name || 'Order Item'}{' '}
                              {order.items?.length > 1 ? `+${order.items.length - 1} more` : ''}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-300">{order.paymentMethod}</td>
                            <td className="px-6 py-4 font-semibold text-white tabular-nums">
                              ${Number(order.totalAmount || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold bg-slate-950 focus:outline-none ${
                                  STATUS_BADGES[order.status] || STATUS_BADGES.Pending
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order._id)}
                                className="inline-flex p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Delete order"
                              >
                                <IconTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Registered Users & Customers</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live accounts from MongoDB <code className="font-mono text-indigo-300">User</code> collection.
                  </p>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 self-start sm:self-auto"
                >
                  <IconPlus /> Register New User
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-sm text-slate-400">
                    No registered users found yet. Register via <Link href="/register" className="text-indigo-400 underline">/register</Link>.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950/70 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-6 py-3.5">User</th>
                          <th className="px-6 py-3.5">Email</th>
                          <th className="px-6 py-3.5">Verification</th>
                          <th className="px-6 py-3.5">Joined</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-slate-800/30 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                                  {(user.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-white">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-300">{user.email}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  user.isVerified
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                }`}
                              >
                                {user.isVerified ? 'Verified' : 'Pending OTP'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleToggleVerifyUser(user._id)}
                                className="px-2.5 py-1 rounded-lg border border-slate-700 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white transition"
                              >
                                {user.isVerified ? 'Unverify' : 'Verify'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user._id)}
                                className="inline-flex p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Delete user"
                              >
                                <IconTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: API CONSOLE */}
          {activeTab === 'api' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Live Backend API Tester</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Send live requests to <code className="font-mono text-indigo-300">{API_BASE}</code> and inspect JSON payloads.
                  </p>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-2">
                  {API_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setConsoleMethod(preset.method);
                        setConsolePath(preset.path);
                        setConsoleUseKey(preset.useKey);
                        setConsoleBody(preset.body);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-indigo-500/50 text-xs text-slate-300 transition"
                    >
                      <span className="font-mono text-indigo-400 mr-1.5">{preset.method}</span>
                      {preset.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleRunApiConsole} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <select
                      value={consoleMethod}
                      onChange={(e) => setConsoleMethod(e.target.value)}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-indigo-300 focus:outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <input
                      type="text"
                      value={consolePath}
                      onChange={(e) => setConsolePath(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-mono text-white focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={consoleLoading}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white transition"
                    >
                      {consoleLoading ? 'Sending...' : 'Send'}
                    </button>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consoleUseKey}
                      onChange={(e) => setConsoleUseKey(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                    />
                    Include <code className="font-mono text-indigo-300">Authorization: {API_KEY}</code> header (required for registration)
                  </label>

                  {consoleMethod !== 'GET' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">JSON Body</label>
                      <textarea
                        rows={5}
                        value={consoleBody}
                        onChange={(e) => setConsoleBody(e.target.value)}
                        placeholder='{ "email": "test@example.com" }'
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-mono text-emerald-300 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}
                </form>

                {consoleResponse && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold ${
                          consoleResponse.ok ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {consoleResponse.ok ? '200 OK / Success' : 'Request Error'}
                      </span>
                      <span className="font-mono text-slate-500">{consoleResponse.timeMs} ms</span>
                    </div>
                    <pre className="text-xs font-mono text-slate-200 overflow-x-auto max-h-64">
                      {JSON.stringify(consoleResponse.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Endpoint Reference */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-4">
                <h3 className="text-base font-semibold text-white">Active API Reference</h3>
                <div className="space-y-2.5 text-xs font-mono">
                  {[
                    ['POST', '/api/auth/register', 'secureApi'],
                    ['POST', '/api/auth/otp', 'Verify OTP'],
                    ['POST', '/api/auth/resend-otp', 'New OTP'],
                    ['POST', '/api/auth/login', 'Bcrypt Auth'],
                    ['POST', '/api/auth/forgetpassword', 'Reset OTP'],
                    ['POST', '/api/auth/resetpassword', 'New Pass'],
                    ['GET/POST', '/api/products', 'Catalog CRUD'],
                    ['GET/POST', '/api/orders', 'Orders CRUD'],
                    ['GET', '/api/users', 'User List'],
                    ['GET', '/api/stats', 'Dashboard KPI'],
                  ].map(([m, path, note]) => (
                    <div
                      key={path}
                      className="flex items-center justify-between rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2"
                    >
                      <span className="truncate">
                        <span className="text-indigo-400 font-semibold mr-2">{m}</span>
                        <span className="text-slate-200">{path}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        loading={actionLoading}
      />

      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onSave={handleCreateOrder}
        loading={actionLoading}
      />
    </div>
  );
}
