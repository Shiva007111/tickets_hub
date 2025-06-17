const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
/*
const logger = require('./utils/logger');
const { requestLogging, errorLogging } = require('./middlewares/loggingMiddleware');
const authRoutes = require('./routes/authRoutes');
const userServiceRoutes = require('./routes/userServiceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const rateLimiter = require('./middlewares/rateLimiter');
const authenticateToken = require('./middlewares/authMiddleware');
*/
dotenv.config();

// do 
// npx prisma migrate dev --name init 
// for schema generation
// and 
// npx prisma generate
// for prisma client generation

const app = express();

// Basic middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Logging middleware - will log all requests
//app.use(requestLogging);

// Routes
//app.use('/api/auth', /* rateLimiter.authLimiter, */ authRoutes);

//app.use('/api/services', /* rateLimiter.apiLimiter, */ authenticateToken, serviceRoutes);

//app.use('/api/user_service', /* rateLimiter.apiLimiter, */ authenticateToken, userServiceRoutes);

// Error logging middleware - should be after routes
//app.use(errorLogging);

// Final error handler
app.use((err, req, res, next) => {
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(3000, () => {
    console.log('Server started', { 
        port: 3000, 
        nodeEnv: 'development',
        timestamp: new Date().toISOString()
    });
});


app.get("/", (req, res) => {
	    res.status(200).json({success: true, message: "Hello World"})
	    })
/*
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
        reason: reason,
        stack: reason.stack
    });
});
*/
