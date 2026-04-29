import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'CORS_ORIGIN'
];

requiredEnvs.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ CRITICAL ERROR: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI as string,
  
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },

  client: {
    url: process.env.CLIENT_URL as string,
    corsOrigin: process.env.CORS_ORIGIN as string,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },

  redisUrl: process.env.REDIS_URL || '',
  upstash: {
    restUrl: process.env.UPSTASH_REDIS_REST_URL || '',
    restToken: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  },
  
  socketPort: parseInt(process.env.SOCKET_PORT || '5001', 10),
  
  logLevel: process.env.LOG_LEVEL || 'info',

  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  exports: {
    pdfPath: process.env.PDF_STORAGE_PATH || 'uploads/invoices',
    excelPath: process.env.EXCEL_EXPORT_PATH || 'exports/excel',
    csvPath: process.env.CSV_EXPORT_PATH || 'exports/csv',
  }
} as const;
