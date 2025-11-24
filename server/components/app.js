const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const apiLimiter = require('./middleware/rateLimit');

const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security
app.disable('x-powered-by');
app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());
app.use(apiLimiter);

// Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging & Cookies
app.use(morgan('dev'));
app.use(cookieParser());

// CORS - ⬇️ UPDATED SECTION
const allowedOrigins = [
  'http://localhost:5173',
  'https://employee-dashboard-9jvq.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// ⬆️ END OF UPDATED SECTION

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Health & Error
app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.get('/', (req, res) => {
  res.json({ 
    message: 'Employee Management API',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      employees: '/api/employees'
    }
  });
});
app.use(errorHandler);

module.exports = app;