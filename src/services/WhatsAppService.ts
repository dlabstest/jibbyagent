import { EventEmitter } from 'events';
import twilio from 'twilio';
import { Logger } from '../utils/logger';
import { IMessage, IWhatsAppConfig } from '../models';

export class WhatsAppService extends EventEmitter {
  private client: twilio.Twilio | null = null;
  private config: IWhatsAppConfig;
  private logger: Logger;
  private webhookUrl: string | undefined;
  private isConnected: boolean = false;

  constructor(config: IWhatsAppConfig) {
    super();
    this.config = config;
    this.logger = new Logger('WhatsAppService');
    this.initialize();
  }

  private initialize(): void {
    if (this.config.enabled && this.config.accountSid && this.config.authToken) {
      try {
        this.client = twilio(this.config.accountSid, this.config.authToken);
        this.logger.info('WhatsApp service initialized');
      } catch (error) {
        this.logger.error('Failed to initialize WhatsApp service:', error);
        throw error;
      }
    } else {
      this.logger.warn('WhatsApp service is disabled or missing configuration');
    }
  }

  public async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('WhatsApp client not initialized');
    }

    try {
      // Verify credentials by making a test API call
      await this.client.messages.list({ limit: 1 });
      this.isConnected = true;
      this.logger.info('Successfully connected to WhatsApp Business API');
      this.emit('connected');
    } catch (error) {
      this.logger.error('Failed to connect to WhatsApp Business API:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.logger.info('Disconnected from WhatsApp Business API');
    this.emit('disconnected');
  }

  public async sendMessage(message: IMessage): Promise<void> {
    if (!this.isConnected || !this.client) {
      throw new Error('WhatsApp service is not connected');
    }

    try {
      const { recipient, content } = message;
      
      // Format recipient number if needed (ensure it's in E.164 format)
      const to = recipient.startsWith('whatsapp:') ? recipient : `whatsapp:${recipient}`;
      
      // Send message via Twilio WhatsApp API
      const result = await this.client.messages.create({
        body: content,
        from: `whatsapp:${this.config.phoneNumberId}`,
        to,
        statusCallback: this.webhookUrl ? `${this.webhookUrl}/whatsapp/status` : undefined,
      });

      this.logger.debug(`Message sent to ${to}: ${result.sid}`);
      
      // Emit event with the sent message
      this.emit('messageSent', {
        ...message,
        id: result.sid,
        status: 'sent',
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public async handleIncomingMessage(payload: any): Promise<void> {
    try {
      // Parse incoming webhook payload
      const message: IMessage = {
        id: payload.MessageSid,
        conversationId: payload.ConversationSid || payload.MessageSid,
        sender: payload.From,
        recipient: payload.To,
        content: payload.Body,
        channel: 'whatsapp',
        timestamp: new Date(),
        status: 'delivered',
        metadata: {
          ...payload,
        },
      };

      this.logger.debug(`Received message from ${message.sender}: ${message.content}`);
      
      // Emit the message to be processed by the Jibby service
      this.emit('message', message);
    } catch (error) {
      this.logger.error('Error processing incoming WhatsApp message:', error);
      this.emit('error', error);
    }
  }

  public async handleStatusUpdate(payload: any): Promise<void> {
    try {
      const { MessageSid, MessageStatus } = payload;
      
      // Update message status in your database or emit an event
      this.emit('messageStatus', {
        messageId: MessageSid,
        status: MessageStatus,
        timestamp: new Date(),
      });

      this.logger.debug(`Message ${MessageSid} status updated to: ${MessageStatus}`);
    } catch (error) {
      this.logger.error('Error processing WhatsApp status update:', error);
      this.emit('error', error);
    }
  }

  public updateConfig(config: Partial<IWhatsAppConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reinitialize if account SID or auth token changed
    if (config.accountSid || config.authToken) {
      this.initialize();
    }
    
    this.logger.info('WhatsApp service configuration updated');
  }

  public setWebhookUrl(url: string): void {
    this.webhookUrl = url;
    this.logger.info(`Webhook URL set to: ${url}`);
  }

  public getStatus(): { connected: boolean; phoneNumber?: string } {
    return {
      connected: this.isConnected,
      phoneNumber: this.config.phoneNumberId,
    };
  }
}
