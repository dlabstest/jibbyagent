import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { IMessage, IConversation, IAgentConfig, IConversationHistory } from '../models';
import { WhatsAppService } from '../services/WhatsAppService';
import { VoiceService } from '../services/VoiceService';
import { SocialMediaService } from '../services/SocialMediaService';
import { AIService } from '../services/AIService';

export class JibbyService extends EventEmitter {
  private logger: Logger;
  private whatsAppService: WhatsAppService;
  private voiceService: VoiceService;
  private socialMediaService: SocialMediaService;
  private aiService: AIService;
  private config: IAgentConfig;
  private conversations: Map<string, IConversation> = new Map();

  constructor(config: IAgentConfig) {
    super();
    this.config = config;
    this.logger = new Logger('JibbyService');
    this.aiService = new AIService(config.ai);
    this.whatsAppService = new WhatsAppService(config.whatsApp);
    this.voiceService = new VoiceService(config.voice);
    this.socialMediaService = new SocialMediaService(config.socialMedia);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle incoming messages from different channels
    this.whatsAppService.on('message', this.handleIncomingMessage.bind(this));
    this.voiceService.on('call', this.handleIncomingCall.bind(this));
    this.socialMediaService.on('message', this.handleSocialMediaMessage.bind(this));
  }

  private async handleIncomingMessage(message: IMessage): Promise<void> {
    try {
      const conversation = await this.getOrCreateConversation(message.conversationId);
      conversation.messages.push(message);
      
      // Process message with AI
      const response = await this.aiService.processMessage(message, conversation.history);
      
      // Send response back through the same channel
      await this.sendMessage({
        ...response,
        conversationId: message.conversationId,
        channel: message.channel,
        recipient: message.sender
      });

      this.emit('messageProcessed', { message, response });
    } catch (error) {
      this.logger.error('Error processing incoming message:', error);
      this.emit('error', error);
    }
  }

  private async handleIncomingCall(callData: any): Promise<void> {
    try {
      const response = await this.voiceService.handleCall(callData);
      this.emit('callHandled', { callData, response });
    } catch (error) {
      this.logger.error('Error handling incoming call:', error);
      this.emit('error', error);
    }
  }

  private async handleSocialMediaMessage(message: any): Promise<void> {
    try {
      // Process social media message
      const response = await this.socialMediaService.processMessage(message);
      this.emit('socialMediaMessageProcessed', { message, response });
    } catch (error) {
      this.logger.error('Error processing social media message:', error);
      this.emit('error', error);
    }
  }

  public async sendMessage(message: IMessage): Promise<void> {
    try {
      switch (message.channel) {
        case 'whatsapp':
          await this.whatsAppService.sendMessage(message);
          break;
        case 'voice':
          await this.voiceService.sendMessage(message);
          break;
        case 'social':
          await this.socialMediaService.sendMessage(message);
          break;
        default:
          throw new Error(`Unsupported channel: ${message.channel}`);
      }
      this.emit('messageSent', message);
    } catch (error) {
      this.logger.error('Error sending message:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private async getOrCreateConversation(conversationId: string): Promise<IConversation> {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {}
      });
    }
    return this.conversations.get(conversationId)!;
  }

  public async getConversationHistory(conversationId: string): Promise<IConversationHistory> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    return {
      id: conversation.id,
      messages: conversation.messages,
      metadata: conversation.metadata
    };
  }

  public async updateConfig(config: Partial<IAgentConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    // Update services with new config
    if (config.whatsApp) this.whatsAppService.updateConfig(config.whatsApp);
    if (config.voice) this.voiceService.updateConfig(config.voice);
    if (config.socialMedia) this.socialMediaService.updateConfig(config.socialMedia);
    if (config.ai) this.aiService.updateConfig(config.ai);
    
    this.emit('configUpdated', this.config);
  }

  public async start(): Promise<void> {
    try {
      await Promise.all([
        this.whatsAppService.connect(),
        this.voiceService.initialize(),
        this.socialMediaService.connect()
      ]);
      this.logger.info('Jibby service started successfully');
      this.emit('started');
    } catch (error) {
      this.logger.error('Failed to start Jibby service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      await Promise.all([
        this.whatsAppService.disconnect(),
        this.voiceService.cleanup(),
        this.socialMediaService.disconnect()
      ]);
      this.logger.info('Jibby service stopped');
      this.emit('stopped');
    } catch (error) {
      this.logger.error('Error stopping Jibby service:', error);
      this.emit('error', error);
      throw error;
    }
  }
}
