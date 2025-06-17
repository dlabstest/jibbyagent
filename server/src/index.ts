import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import integrationRoutes from './routes/integrations';
import callRoutes from './routes/calls';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/calls', callRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Start the server
startServer().catch((error) => {
  console.error('Fatal error during server startup:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
