# Inventory & Order Management System (IOMS)

A production-ready Advanced Inventory & Order Management System. 

## Features
- Role-Based Access Control (RBAC)
- Multi-Warehouse & Supplier Management
- Real-time WebSockets Notifications
- PDF & Excel Reporting
- Cloudinary Image Uploads

## Environment Variables Setup

Before running the project, you must set up your environment variables.
Example `.env.example` files have been provided in both the `/backend` and `/frontend` directories.

### Backend (`/backend/.env`)

Create a `.env` file in the `/backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ioms
JWT_SECRET=your_jwt_secret_change_me
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=test@ethereal.email
EMAIL_PASS=testpass

REDIS_URL=redis://localhost:6379
SOCKET_PORT=5001
LOG_LEVEL=info

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

PDF_STORAGE_PATH=uploads/invoices
EXCEL_EXPORT_PATH=exports/excel
CSV_EXPORT_PATH=exports/csv
```

### Frontend (`/frontend/.env`)

Create a `.env` file in the `/frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Inventory Management System
VITE_SOCKET_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

## How to Run

1. **Install Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start Backend Server:**
   Ensure MongoDB is running locally or provide a valid Atlas connection string in `MONGO_URI`.
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend Client:**
   ```bash
   cd frontend
   npm run dev
   ```

Open `http://localhost:5173` in your browser.
