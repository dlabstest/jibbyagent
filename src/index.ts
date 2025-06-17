import { JibbyService } from './core/JibbyService';
import { JibbyServer } from './api/server';
import { Logger } from './utils/logger';
import { IAgentConfig } from './models';

// Default configuration
const defaultConfig: IAgentConfig = {
  id: 'jibby-default',
  name: 'Jibby Agent Hub',
  description: 'AI-powered agent hub for business communications',
  whatsApp: {
    enabled: false,
  },
  voice: {
    enabled: false,
    provider: 'twilio',
  },
  socialMedia: {
    enabled: false,
    platforms: {},
  },
  ai: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    contextWindow: 10,
    systemPrompt: 'You are Jibby, a helpful AI assistant for business communications.',
  },
  webhook: {
    url: '',
    events: ['*'],
  },
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 60,
  },
  logging: {
    level: 'info',
    format: 'json',
  },
};

/**
 * Jibby Agent Hub - Main class for initializing and managing the agent hub
 */
class Jibby {
  private service: JibbyService;
  private server?: JibbyServer;
  private logger: Logger;
  private config: IAgentConfig;
  private isInitialized: boolean = false;

  /**
   * Create a new Jibby instance
   * @param config Configuration for the Jibby agent hub
   */
  constructor(config: Partial<IAgentConfig> = {}) {
    // Merge default config with provided config
    this.config = { ...defaultConfig, ...config };
    this.logger = new Logger('Jibby');
    this.service = new JibbyService(this.config);
    this.isInitialized = false;
  }

  /**
   * Initialize the Jibby agent hub
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Jibby is already initialized');
      return;
    }

    try {
      this.logger.info('Initializing Jibby Agent Hub...');
      
      // Initialize the core service
      await this.service.start();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.logger.info('Jibby Agent Hub initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Jibby:', error);
      throw error;
    }
  }

  /**
   * Start the Jibby API server
   * @param port Port to start the server on (default: 3000)
   */
  public async startServer(port: number = 3000): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.logger.info(`Starting Jibby API server on port ${port}...`);
      
      this.server = new JibbyServer({
        port,
        agentConfig: this.config,
      });
      
      await this.server.start();
    } catch (error) {
      this.logger.error('Failed to start Jibby server:', error);
      throw error;
    }
  }

  /**
   * Stop the Jibby agent hub and clean up resources
   */
  public async stop(): Promise<void> {
    try {
      this.logger.info('Stopping Jibby Agent Hub...');
      
      // Stop the server if it's running
      if (this.server) {
        await this.server.shutdown();
      }
      
      // Stop the core service
      await this.service.stop();
      
      this.isInitialized = false;
      this.logger.info('Jibby Agent Hub stopped');
    } catch (error) {
      this.logger.error('Error stopping Jibby:', error);
      throw error;
    }
  }

  /**
   * Update the Jibby configuration
   * @param config Partial configuration to update
   */
  public async updateConfig(config: Partial<IAgentConfig>): Promise<void> {
    this.logger.info('Updating Jibby configuration...');
    this.config = { ...this.config, ...config };
    await this.service.updateConfig(config);
    this.logger.info('Configuration updated');
  }

  /**
   * Get the current Jibby configuration
   */
  public getConfig(): IAgentConfig {
    return { ...this.config };
  }

  /**
   * Get the Jibby service instance
   */
  public getService(): JibbyService {
    return this.service;
  }

  /**
   * Set up event listeners for the Jibby service
   */
  private setupEventListeners(): void {
    // Forward events from the service to the Jibby instance
    const events = [
      'message', 'messageSent', 'messageProcessed',
      'call', 'callHandled', 'callEnded',
      'error', 'warning', 'info', 'debug'
    ];

    events.forEach(event => {
      this.service.on(event, (...args: any[]) => {
        this.emit(event, ...args);
      });
    });
  }

  // EventEmitter compatibility
  public on(event: string, listener: (...args: any[]) => void): this {
    this.service.on(event, listener);
    return this;
  }

  public once(event: string, listener: (...args: any[]) => void): this {
    this.service.once(event, listener);
    return this;
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.service.off(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.service.emit(event, ...args);
  }
}

// Export the main Jibby class and types
export { Jibby };
export * from './models';
export * from './services';
export * from './utils/logger';

// If this file is run directly, start the server
if (require.main === module) {
  const jibby = new Jibby();
  
  // Handle process termination
  const shutdown = async () => {
    try {
      await jibby.stop();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start the server
  jibby.startServer(parseInt(process.env.PORT || '3000', 10))
    .catch(error => {
      console.error('Failed to start Jibby server:', error);
      process.exit(1);
    });
}

export default Jibby;
