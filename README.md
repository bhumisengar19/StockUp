# StockUp 📦

### Full Stack Inventory & Order Management System

StockUp is a full-stack Inventory and Order Management System designed to streamline product management, order processing, warehouse operations, supplier management, and stock tracking.

It helps businesses maintain inventory efficiently, monitor stock movement, generate reports, and manage complete purchase and sales workflows.

---

## 🚀 Live Features

### Authentication System

* Secure Login
* User Registration
* JWT Authentication
* Password Hashing using bcrypt
* Protected Routes

---

### Product Management

* Add New Product
* Edit Product
* Delete Product
* Search Products
* Filter Products
* Product Categories
* Product Variants
* Product Image Upload
* CSV Export

---

### Order Management

* Create Orders
* Update Orders
* Track Orders
* Filter by Status
* Filter by Date Range
* Customer Order History

---

### Purchase Order Management

* Create Purchase Orders
* Track Purchase Orders
* Supplier Integration
* Purchase History
* Auto Stock Update

---

### Supplier Management

* Add Suppliers
* Update Suppliers
* Delete Suppliers
* Supplier History

---

### Customer Management

* Add Customers
* Update Customers
* Delete Customers
* Customer Order Records

---

### Warehouse Management

* Create Warehouses
* Warehouse Stock Management
* Warehouse Analytics

---

### Stock Transfer Management

* Transfer Products Between Warehouses
* Transfer Tracking
* Transfer History

---

### Inventory Tracking

* Stock Monitoring
* Inventory Adjustments
* Low Stock Alerts
* Activity Logs

---

### Reports & Analytics

* Sales Reports
* Inventory Reports
* Revenue Reports
* Product Reports
* Order Reports

---

### Real-Time Features

* Live Notifications
* Activity Monitoring
* Socket.io Integration

---

### Theme System

* Light Mode
* Dark Mode
* Animated Theme Background
* Premium Theme Toggle

---

## 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* Zustand
* Axios
* React Router DOM
* Socket.io Client

---

## Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT
* bcrypt
* Redis
* Socket.io

---

## Third Party Integrations

* MongoDB Atlas
* Cloudinary
* Upstash Redis
* Brevo SMTP

---

## 📁 Project Structure

```text
StockUp/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   ├── sockets/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── store/
│   │   ├── context/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── package.json
└── README.md
```

---

## ⚙️ Installation Guide

Clone repository:

```bash
git clone https://github.com/bhumisengar19/Stockup.git
```

Move into project directory:

```bash
cd Stockup
```

---

## Backend Setup

Move into backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

REDIS_URL=your_redis_url

SOCKET_PORT=5001

LOG_LEVEL=info

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

PDF_STORAGE_PATH=uploads/invoices
EXCEL_EXPORT_PATH=exports/excel
CSV_EXPORT_PATH=exports/csv
```

Run backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

Move into frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=StockUp
VITE_SOCKET_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🔐 Authentication Flow

1. User registers
2. Password is hashed using bcrypt
3. User data stored in MongoDB
4. User logs in
5. JWT token generated
6. Token stored in browser
7. Protected APIs validated

---

## 📦 Core Modules

* Authentication
* Products
* Orders
* Customers
* Suppliers
* Purchase Orders
* Warehouses
* Stock Transfers
* Reports
* Activities
* Settings

---

## 📡 API Modules

### Auth APIs

* Register
* Login
* Logout

### Product APIs

* Create Product
* Get Products
* Update Product
* Delete Product

### Order APIs

* Create Order
* Update Order
* Track Order

### Customer APIs

* Add Customer
* Update Customer
* Delete Customer

### Supplier APIs

* Add Supplier
* Update Supplier
* Delete Supplier

### Purchase APIs

* Create Purchase Order
* Purchase History

### Warehouse APIs

* Create Warehouse
* Warehouse Stock

### Transfer APIs

* Create Transfer
* Transfer History

### Reports APIs

* Inventory Reports
* Sales Reports
* Revenue Reports

---

## 📊 Database Collections

* Users
* Products
* Orders
* Customers
* Suppliers
* PurchaseOrders
* Warehouses
* StockTransfers
* ActivityLogs
* InventoryAdjustments

---

## 🧪 Testing Checklist

Test these modules:

* User Authentication
* Product CRUD
* Order CRUD
* Customer CRUD
* Supplier CRUD
* Warehouse CRUD
* Stock Transfers
* Purchase Orders
* Reports
* CSV Export
* Product Image Upload
* Real-time Notifications

---

## 📈 Future Enhancements

* Barcode Generator
* QR Scanner
* Invoice Generator
* Advanced Analytics
* Mobile App Support
* AI Demand Forecasting

---

## 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Input Validation
* Rate Limiting
* Secure Environment Variables

---

## 📄 License

This project is developed for educational and academic project evaluation purposes.
