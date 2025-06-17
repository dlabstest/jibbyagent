import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { JibbyService } from '../core/JibbyService';
import { IAgentConfig, IAPIResponse, IWebhookPayload } from '../models';
import { Logger } from '../utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { validateRequest } from './middleware/validation';

export class JibbyServer {
  private app: Application;
  private server: http.Server;
  private io: SocketIOServer;
  private jibbyService: JibbyService;
  private logger: Logger;
  private port: number;

  constructor(private config: { port: number; agentConfig: IAgentConfig }) {
    this.port = config.port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    this.jibbyService = new JibbyService(config.agentConfig);
    this.logger = new Logger('JibbyServer');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeWebSockets();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    
    // Request logging
    this.app.use(morgan('combined'));
    
    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Rate limiting
    this.app.use(rateLimiter);
    
    // Authentication
    this.app.use(authMiddleware);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Messages API
    this.app.post(
      '/api/v1/messages',
      validateRequest('createMessage'),
      this.handleAsync(async (req: Request, res: Response) => {
        const message = req.body;
        await this.jibbyService.sendMessage(message);
        this.sendSuccess(res, { message: 'Message sent successfully' });
      })
    );

    // Conversations API
    this.app.get(
      '/api/v1/conversations/:conversationId',
      this.handleAsync(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const history = await this.jibbyService.getConversationHistory(conversationId);
        this.sendSuccess(res, { conversation: history });
      })
    );

    // Webhook endpoint for external services
    this.app.post(
      '/webhook/:provider',
      this.handleAsync(async (req: Request, res: Response) => {
        const { provider } = req.params;
        const payload = req.body;
        
        // Emit webhook event to be handled by the appropriate service
        this.jibbyService.emit(`${provider}:webhook`, payload);
        
        // Acknowledge receipt of webhook
        res.status(200).json({ status: 'received' });
      })
    );
  }

  private initializeWebSockets(): void {
    this.io.on('connection', (socket) => {
      this.logger.info(`New WebSocket connection: ${socket.id}`);

      // Join conversation room
      socket.on('join', (conversationId: string) => {
        socket.join(conversationId);
        this.logger.debug(`Socket ${socket.id} joined conversation ${conversationId}`);
      });

      // Handle real-time messaging
      socket.on('sendMessage', async (message: any, callback: Function) => {
        try {
          await this.jibbyService.sendMessage(message);
          this.io.to(message.conversationId).emit('newMessage', message);
          callback({ status: 'ok' });
        } catch (error: any) {
          callback({ status: 'error', message: error.message });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.logger.info(`WebSocket disconnected: ${socket.id}`);
      });
    });

    // Forward Jibby service events to WebSocket clients
    const events = ['messageSent', 'messageProcessed', 'callHandled', 'error'];
    events.forEach((event) => {
      this.jibbyService.on(event, (data: any) => {
        this.io.emit(event, data);
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      this.sendError(res, 404, 'Not Found');
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  private handleAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  private sendSuccess(res: Response, data: any, statusCode: number = 200): void {
    const response: IAPIResponse = { success: true, data };
    res.status(statusCode).json(response);
  }

  private sendError(res: Response, statusCode: number, message: string, error?: any): void {
    const response: IAPIResponse = {
      success: false,
      error: {
        code: statusCode.toString(),
        message,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }
    };
    res.status(statusCode).json(response);
  }

  public async start(): Promise<void> {
    try {
      await this.jibbyService.start();
      
      this.server.listen(this.port, () => {
        this.logger.info(`Jibby server running on port ${this.port}`);
        this.logger.info(`API Documentation available at http://localhost:${this.port}/api-docs`);
      });

      // Handle graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));
    } catch (error) {
      this.logger.error('Failed to start Jibby server:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    this.logger.info('Shutting down Jibby server...');
    
    try {
      await this.jibbyService.stop();
      this.server.close(() => {
        this.logger.info('Server has been stopped');
        process.exit(0);
      });
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}
