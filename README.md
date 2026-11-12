<div align="center">

# 🛒 NovaCommerce — Full-Stack E-Commerce & Admin Console

**A modern full-stack e-commerce platform pairing an Express 5 + MongoDB REST API with a sleek Next.js 14 + Tailwind CSS admin dashboard.**

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.3-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## ✨ Highlights

### 🖥️ Admin Dashboard (`eccomerce-dashboard`)
- **Executive Overview** — Real-time KPI cards (Revenue, Total Orders, Catalog Products, Registered Users), interactive annual Revenue & Order Velocity chart, low-stock alerts, and 1-click demo data seeding.
- **Product Inventory CRUD** — Search, category filtering, stock status indicators (`In Stock`, `Low Stock`, `Out of Stock`), and modal-based Create/Edit/Delete backed by MongoDB.
- **Order Fulfillment** — Create customer orders and update order statuses inline (`Pending` → `Processing` → `Shipped` → `Delivered` → `Cancelled`).
- **Customer Directory** — Live MongoDB user list showing email verification state with admin verify/unverify and delete actions.
- **Built-in Live API Console** — Test every backend endpoint directly inside the browser with one-click presets and JSON response inspection.
- **Authentication UI** — Split-screen **Login + Forgot/Reset Password** (`/login`) and **Registration + 6-Digit OTP Verification** (`/register`) flows.

### ⚙️ Backend API (`ecommerce-backend`)
- **Secure Authentication** — `bcryptjs` password hashing, email normalization, regex validation, and `secureApi` header protection on registration.
- **6-Digit OTP Email Delivery** — Branded HTML + plain-text OTP emails via Nodemailer & Gmail SMTP for account verification and password recovery.
- **Auto-Seeded Admin Account** — Automatically provisions a verified default admin user on first MongoDB connection.
- **E-Commerce Data Models** — Mongoose schemas and REST endpoints for `User`, `Product`, and `Order` plus live health and analytics aggregation.

---

## 🗂️ Project Structure

```text
eccomerce-project/
├── eccomerce-dashboard/            # Next.js 14 + Tailwind CSS Frontend
│   ├── app/
│   │   ├── page.js                 # Multi-tab Admin Dashboard
│   │   ├── login/page.js           # Sign In, Forgot & Reset Password
│   │   ├── register/page.js        # Sign Up & 6-Digit OTP Verification
│   │   ├── layout.js
│   │   └── globals.css
│   ├── components/
│   │   ├── Icons.js                # Crisp inline SVG icon set
│   │   ├── RevenueChart.js         # Interactive Revenue & Orders chart
│   │   ├── ProductModal.js         # Add / Edit Product modal
│   │   └── OrderModal.js           # Create Order modal
│   └── lib/
│       └── api.js                  # Centralized fetch & session helpers
│
└── ecommerce-backend/              # Node.js + Express 5 + MongoDB API
    ├── index.js                    # Express server entry point (Port 8000)
    ├── .env.example                # Environment variable template
    ├── dbConfig/mongodbConfig.js   # MongoDB connection + default admin seeder
    ├── helpers/emailVerification.js# Gmail SMTP & HTML OTP mailer
    ├── middlewars/secureapi.js     # API key middleware (Authorization header)
    ├── models/
    │   ├── userSchema.js
    │   ├── productSchema.js
    │   └── orderSchema.js
    ├── controllers/
    │   ├── registrationController.js
    │   ├── loginController.js
    │   ├── otpController.js
    │   ├── forgetPasswordController.js
    │   ├── productController.js
    │   ├── orderController.js
    │   └── dashboardController.js
    └── route/
        ├── index.js
        └── api/
            ├── index.js
            ├── productRoutes.js
            ├── orderRoutes.js
            ├── dashboardRoutes.js
            └── authRoutes/
                ├── registration.js
                ├── login.js
                ├── otp.js
                └── forgetpassword.js
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/rovacmarco/exam-ecommerce.git
cd exam-ecommerce
```

### 2. Configure & Start the Backend (`Port 8000`)
```bash
cd ecommerce-backend
npm install
```

Create `ecommerce-backend/.env` (using `.env.example` as a guide):
```env
PORT=8000
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your16lettergoogleapppassword
```

> **Gmail OTP Note:** Google blocks regular account passwords on SMTP (`534-5.7.9`). Enable **2-Step Verification** on your Google account and generate a 16-letter **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) for `EMAIL_PASS`.

Start the backend server:
```bash
npm start
```

### 3. Configure & Start the Dashboard (`Port 3000`)
Open a second terminal:
```bash
cd eccomerce-dashboard
npm install
```

Optionally create `eccomerce-dashboard/.env.local` (defaults are already built in):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=Aa@4444444
```

Start the Next.js development server:
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Default Admin Credentials

When the backend connects to MongoDB, `seedDefaultAdmin` automatically creates a verified admin account if it doesn't exist yet:

| Field | Value |
| :--- | :--- |
| **Email** | `admin@novacommerce.com` |
| **Password** | `Admin@123` |

Login at **[http://localhost:3000/login](http://localhost:3000/login)**.

---

## 📡 API Reference

Base URL: `http://localhost:8000`

### Authentication
| Method | Endpoint | Protection / Body | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Header `Authorization: Aa@4444444` · `{ name, email, password }` | Register user & send 6-digit OTP |
| `POST` | `/api/auth/otp` | `{ email, otp }` | Verify account email OTP |
| `POST` | `/api/auth/resend-otp` | `{ email }` | Generate & resend verification OTP |
| `POST` | `/api/auth/login` | `{ email, password }` | Authenticate user |
| `POST` | `/api/auth/forgetpassword` | `{ email }` | Send password reset OTP |
| `POST` | `/api/auth/resetpassword` | `{ email, otp, newPassword }` | Reset password using OTP |

### Products, Orders & Dashboard
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server, MongoDB & SMTP configuration status |
| `GET` | `/api/stats` | Aggregated revenue, order, product & user KPIs |
| `GET` / `POST` | `/api/products` | List all products or create a new product |
| `POST` | `/api/products/seed` | Seed 5 sample e-commerce products |
| `PUT` / `DELETE` | `/api/products/:id` | Update or delete a product |
| `GET` / `POST` | `/api/orders` | List all orders or create a new order |
| `POST` | `/api/orders/seed` | Seed 4 sample customer orders |
| `PATCH` / `DELETE` | `/api/orders/:id` | Update order status or delete an order |
| `GET` | `/api/users` | List registered users (passwords/OTPs excluded) |
| `PATCH` | `/api/users/:id/verify` | Toggle user email verification status |
| `DELETE` | `/api/users/:id` | Remove a user account |

---

<div align="center">
Built with ❤️ using Express, MongoDB, Next.js & Tailwind CSS
</div>
