import { EventEmitter } from 'events';
import OpenAI from 'openai';
import { Logger } from '../utils/logger';
import { IMessage, IAIConfig, IConversationHistory } from '../models';

export class AIService extends EventEmitter {
  private client: any;
  private config: IAIConfig;
  private logger: Logger;
  private conversationContexts: Map<string, any> = new Map();

  constructor(config: IAIConfig) {
    super();
    this.config = config;
    this.logger = new Logger('AIService');
    this.initialize();
  }

  private initialize(): void {
    try {
      switch (this.config.provider) {
        case 'openai':
          if (!this.config.apiKey) {
            throw new Error('OpenAI API key is required');
          }
          this.client = new OpenAI({
            apiKey: this.config.apiKey,
          });
          break;
        case 'anthropic':
          // Initialize Anthropic client if needed
          break;
        case 'custom':
          // Initialize custom AI provider
          break;
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
      this.logger.info(`AI service initialized with ${this.config.provider}`);
    } catch (error) {
      this.logger.error('Failed to initialize AI service:', error);
      throw error;
    }
  }

  public async processMessage(
    message: IMessage,
    history: IConversationHistory
  ): Promise<IMessage> {
    try {
      this.logger.debug(`Processing message in conversation: ${message.conversationId}`);
      
      // Get or create conversation context
      const context = this.getConversationContext(message.conversationId, history);
      
      // Prepare messages for the AI model
      const messages = this.prepareMessages(message, context);
      
      // Call the appropriate AI model
      const response = await this.generateResponse(messages, context);
      
      // Create response message
      const responseMessage: IMessage = {
        id: `ai-${Date.now()}`,
        conversationId: message.conversationId,
        sender: 'jibby-ai',
        recipient: message.sender,
        content: response.content,
        channel: message.channel,
        timestamp: new Date(),
        status: 'sent',
        metadata: {
          model: this.config.model,
          usage: response.usage,
        },
      };

      // Update conversation context
      this.updateConversationContext(message.conversationId, message, responseMessage);
      
      this.emit('responseGenerated', {
        request: message,
        response: responseMessage,
        conversationId: message.conversationId,
      });

      return responseMessage;
    } catch (error) {
      this.logger.error('Error processing message with AI:', error);
      this.emit('error', error);
      
      // Return a friendly error message
      return {
        id: `error-${Date.now()}`,
        conversationId: message.conversationId,
        sender: 'jibby-ai',
        recipient: message.sender,
        content: 'I apologize, but I encountered an error processing your request. Please try again later.',
        channel: message.channel,
        timestamp: new Date(),
        status: 'failed',
        metadata: { error: error.message },
      };
    }
  }

  private getConversationContext(conversationId: string, history: IConversationHistory): any {
    if (!this.conversationContexts.has(conversationId)) {
      this.conversationContexts.set(conversationId, {
        history: [],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Update with provided history if available
    if (history) {
      const context = this.conversationContexts.get(conversationId);
      context.history = history.messages || [];
      context.metadata = { ...context.metadata, ...(history.metadata || {}) };
      this.conversationContexts.set(conversationId, context);
    }
    
    return this.conversationContexts.get(conversationId);
  }

  private prepareMessages(message: IMessage, context: any): any[] {
    // Start with system message if configured
    const messages: any[] = [];
    
    if (this.config.systemPrompt) {
      messages.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }
    
    // Add conversation history
    if (context.history && context.history.length > 0) {
      // Limit history to prevent context window overflow
      const maxHistory = this.config.contextWindow || 10; // Default to last 10 messages
      const recentHistory = context.history.slice(-maxHistory);
      
      recentHistory.forEach((msg: IMessage) => {
        messages.push({
          role: msg.sender === 'jibby-ai' ? 'assistant' : 'user',
          content: msg.content,
          name: msg.sender,
        });
      });
    }
    
    // Add current message
    messages.push({
      role: 'user',
      content: message.content,
      name: message.sender,
    });
    
    return messages;
  }

  private async generateResponse(messages: any[], context: any): Promise<{ content: string; usage?: any }> {
    try {
      switch (this.config.provider) {
        case 'openai':
          return this.generateOpenAIResponse(messages);
        case 'anthropic':
          return this.generateAnthropicResponse(messages);
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
    } catch (error) {
      this.logger.error('Error generating AI response:', error);
      throw error;
    }
  }

  private async generateOpenAIResponse(messages: any[]): Promise<{ content: string; usage?: any }> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.client.chat.completions.create({
      model: this.config.model || 'gpt-4', // Default to gpt-4 if not specified
      messages,
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 1000,
    });

    return {
      content: response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.',
      usage: response.usage,
    };
  }

  private async generateAnthropicResponse(messages: any[]): Promise<{ content: string; usage?: any }> {
    // Implementation for Anthropic's Claude
    // This is a placeholder - you would need to implement the actual API call
    this.logger.warn('Anthropic integration not yet implemented');
    return {
      content: 'Anthropic integration is not yet implemented. Please use OpenAI or another supported provider.',
    };
  }

  private updateConversationContext(conversationId: string, userMessage: IMessage, aiResponse: IMessage): void {
    const context = this.conversationContexts.get(conversationId) || {
      history: [],
      metadata: {},
      createdAt: new Date(),
    };
    
    // Add messages to history
    context.history.push(userMessage, aiResponse);
    context.updatedAt = new Date();
    
    // Update context
    this.conversationContexts.set(conversationId, context);
    
    // Emit event for context update
    this.emit('contextUpdated', {
      conversationId,
      context,
    });
  }

  public getConversationContext(conversationId: string): any | undefined {
    return this.conversationContexts.get(conversationId);
  }

  public clearConversationContext(conversationId: string): void {
    this.conversationContexts.delete(conversationId);
    this.emit('contextCleared', { conversationId });
  }

  public updateConfig(config: Partial<IAIConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reinitialize if provider or API key changed
    if (config.provider || config.apiKey) {
      this.initialize();
    }
    
    this.logger.info('AI service configuration updated');
  }

  public getStatus(): { provider: string; model?: string; activeConversations: number } {
    return {
      provider: this.config.provider,
      model: this.config.model,
      activeConversations: this.conversationContexts.size,
    };
  }
}
