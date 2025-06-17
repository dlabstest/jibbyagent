// Core Types
export interface IMessage {
  id: string;
  conversationId: string;
  sender: string;
  recipient: string;
  content: string;
  channel: 'whatsapp' | 'voice' | 'social' | 'email' | 'sms';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
}

export interface IConversation {
  id: string;
  participants: string[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface IConversationHistory {
  id: string;
  messages: IMessage[];
  metadata: Record<string, any>;
}

// Configuration Types
export interface IWhatsAppConfig {
  enabled: boolean;
  accountSid?: string;
  authToken?: string;
  phoneNumberId?: string;
  webhookSecret?: string;
  webhookUrl?: string;
}

export interface IVoiceConfig {
  enabled: boolean;
  provider: 'twilio' | 'plivo' | 'custom';
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  webhookUrl?: string;
  language?: string;
  voice?: string;
}

export interface ISocialMediaConfig {
  enabled: boolean;
  platforms: {
    facebook?: {
      pageId?: string;
      accessToken?: string;
    };
    instagram?: {
      accountId?: string;
      accessToken?: string;
    };
    twitter?: {
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessTokenSecret?: string;
    };
  };
}

export interface IAIConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  contextWindow?: number;
}

export interface IAgentConfig {
  id: string;
  name: string;
  description?: string;
  whatsApp: IWhatsAppConfig;
  voice: IVoiceConfig;
  socialMedia: ISocialMediaConfig;
  ai: IAIConfig;
  webhook?: {
    url: string;
    secret?: string;
    events: string[];
  };
  rateLimiting?: {
    enabled: boolean;
    maxRequestsPerMinute?: number;
  };
  logging?: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'silly';
    format: 'json' | 'text';
  };
  metadata?: Record<string, any>;
}

// API Types
export interface IAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface IWebhookPayload<T = any> {
  event: string;
  timestamp: string;
  payload: T;
}

// Enums
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum ChannelType {
  WHATSAPP = 'whatsapp',
  VOICE = 'voice',
  SOCIAL = 'social',
  EMAIL = 'email',
  SMS = 'sms'
}
