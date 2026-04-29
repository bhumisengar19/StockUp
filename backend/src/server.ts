import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { createServer } from 'http';
import { connectDB } from './config/db';
import redisClient from './config/redis';
import { initSocket } from './sockets';
import { config } from './config/config';

// Routes
import authRoutes    from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes   from './routes/orderRoutes';
import reportRoutes  from './routes/reportRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
import supplierRoutes  from './routes/supplierRoutes';
import customerRoutes  from './routes/customerRoutes';
import activityRoutes  from './routes/activityRoutes';
import userRoutes      from './routes/userRoutes';
import warehouseStockRoutes from './routes/warehouseStockRoutes';
import stockTransferRoutes from './routes/stockTransferRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import inventoryAdjustmentRoutes from './routes/inventoryAdjustmentRoutes';
import returnRoutes from './routes/returnRoutes';
import financeRoutes from './routes/financeRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Security Middleware
app.use(helmet());
app.use(cors({ origin: config.client.corsOrigin, credentials: true }));
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.window * 60 * 1000,
  max: config.rateLimit.max,
  message: `Too many requests from this IP, please try again after ${config.rateLimit.window} minutes`
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect DB
connectDB();

// API Routes
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/suppliers',  supplierRoutes);
app.use('/api/customers',  customerRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/stock',      warehouseStockRoutes);
app.use('/api/transfers',  stockTransferRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/adjustments', inventoryAdjustmentRoutes);
app.use('/api/returns',    returnRoutes);
app.use('/api/finance',    financeRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV }));

const PORT = config.port;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Server running on http://0.0.0.0:${PORT} in ${config.env} mode`);
});
