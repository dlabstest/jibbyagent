import { EventEmitter } from 'events';
import twilio from 'twilio';
import { Logger } from '../utils/logger';
import { IMessage, IVoiceConfig, CallDirection, CallStatus } from '../models';

type CallHandler = (call: any) => Promise<void> | void;

export class VoiceService extends EventEmitter {
  private client: twilio.Twilio | null = null;
  private config: IVoiceConfig;
  private logger: Logger;
  private callHandlers: Map<string, CallHandler> = new Map();
  private activeCalls: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  constructor(config: IVoiceConfig) {
    super();
    this.config = config;
    this.logger = new Logger('VoiceService');
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.config.accountSid || !this.config.authToken) {
      this.logger.warn('Voice service is missing required configuration (accountSid or authToken)');
      return;
    }

    try {
      this.client = twilio(this.config.accountSid, this.config.authToken);
      this.isInitialized = true;
      this.logger.info('Voice service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize voice service:', error);
      throw error;
    }
  }

  public async initializeCallHandling(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Voice service is not initialized');
    }

    this.logger.info('Initializing call handling');
    // In a real implementation, this would set up webhook handling for incoming calls
    this.emit('initialized');
  }

  public async makeCall(to: string, from: string, options: any = {}): Promise<any> {
    if (!this.client || !this.isInitialized) {
      throw new Error('Voice service is not properly initialized');
    }

    try {
      const call = await this.client.calls.create({
        url: this.config.webhookUrl || '', // URL that returns TwiML instructions
        to: to.startsWith('+') ? to : `+${to}`,
        from: from.startsWith('+') ? from : `+${from}`,
        ...options,
      });

      this.activeCalls.set(call.sid, call);
      this.logger.info(`Outgoing call initiated: ${call.sid}`);
      
      this.emit('callInitiated', {
        callSid: call.sid,
        to,
        from,
        direction: 'outbound' as CallDirection,
        status: call.status as CallStatus,
        timestamp: new Date(),
      });

      return call;
    } catch (error) {
      this.logger.error('Failed to initiate call:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public async handleIncomingCall(callSid: string, payload: any): Promise<void> {
    try {
      this.logger.info(`Incoming call received: ${callSid}`);
      
      const callInfo = {
        callSid,
        from: payload.From,
        to: payload.To,
        direction: 'inbound' as CallDirection,
        status: 'in-progress' as CallStatus,
        timestamp: new Date(),
        payload,
      };

      this.activeCalls.set(callSid, callInfo);
      
      // Emit event that can be handled by the Jibby service
      this.emit('call', callInfo);
      
      // Emit specific event for incoming call
      this.emit('incomingCall', callInfo);
    } catch (error) {
      this.logger.error('Error handling incoming call:', error);
      this.emit('error', error);
    }
  }

  public async sendMessage(message: IMessage): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Voice service is not initialized');
    }

    try {
      // For voice messages, we might convert text to speech and initiate a call
      // or send an audio message via a messaging channel
      this.logger.debug(`Sending voice message to ${message.recipient}: ${message.content.substring(0, 50)}...`);
      
      // Here you would implement the actual voice message sending logic
      // For example, using Twilio's <Say> verb or pre-recorded audio
      
      this.emit('messageSent', {
        ...message,
        id: `voice-${Date.now()}`,
        status: 'sent',
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to send voice message:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public async endCall(callSid: string): Promise<void> {
    if (!this.client || !this.isInitialized) {
      throw new Error('Voice service is not properly initialized');
    }

    try {
      await this.client.calls(callSid).update({ status: 'completed' });
      this.activeCalls.delete(callSid);
      this.logger.info(`Call ended: ${callSid}`);
      
      this.emit('callEnded', {
        callSid,
        status: 'completed' as CallStatus,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to end call ${callSid}:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  public async handleCallStatusUpdate(payload: any): Promise<void> {
    try {
      const { CallSid, CallStatus } = payload;
      this.logger.debug(`Call status update for ${CallSid}: ${CallStatus}`);
      
      // Update call status in active calls
      if (this.activeCalls.has(CallSid)) {
        const call = this.activeCalls.get(CallSid);
        call.status = CallStatus;
        this.activeCalls.set(CallSid, call);
      }
      
      // Emit status update event
      this.emit('callStatus', {
        callSid: CallSid,
        status: CallStatus,
        timestamp: new Date(),
        payload,
      });

      // Handle completed/failed calls
      if (['completed', 'failed', 'busy', 'no-answer'].includes(CallStatus)) {
        this.activeCalls.delete(CallSid);
        this.emit('callEnded', {
          callSid: CallSid,
          status: CallStatus as CallStatus,
          timestamp: new Date(),
          payload,
        });
      }
    } catch (error) {
      this.logger.error('Error handling call status update:', error);
      this.emit('error', error);
    }
  }

  public registerCallHandler(callType: string, handler: CallHandler): void {
    this.callHandlers.set(callType, handler);
    this.logger.debug(`Registered call handler for type: ${callType}`);
  }

  public updateConfig(config: Partial<IVoiceConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reinitialize if account SID or auth token changed
    if (config.accountSid || config.authToken) {
      this.initialize();
    }
    
    this.logger.info('Voice service configuration updated');
  }

  public getActiveCalls(): Map<string, any> {
    return new Map(this.activeCalls);
  }

  public getStatus(): { initialized: boolean; activeCalls: number } {
    return {
      initialized: this.isInitialized,
      activeCalls: this.activeCalls.size,
    };
  }

  public async cleanup(): Promise<void> {
    // Clean up any resources
    this.activeCalls.clear();
    this.callHandlers.clear();
    this.isInitialized = false;
    this.logger.info('Voice service cleaned up');
  }
}
