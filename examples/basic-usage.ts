/**
 * Basic Jibby Agent Hub Example
 * 
 * This example demonstrates how to set up and use the Jibby Agent Hub
 * for handling customer communications across multiple channels.
 */

import { Jibby } from '../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuration for the Jibby agent
const config = {
  id: 'jibby-demo',
  name: 'Jibby Demo Agent',
  description: 'A demo instance of Jibby Agent Hub',
  
  // WhatsApp configuration (using Twilio)
  whatsApp: {
    enabled: process.env.TWILIO_ACCOUNT_SID !== undefined,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumberId: process.env.TWILIO_PHONE_NUMBER,
  },
  
  // Voice configuration (using Twilio)
  voice: {
    enabled: process.env.TWILIO_ACCOUNT_SID !== undefined,
    provider: 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    webhookUrl: process.env.TWILIO_VOICE_WEBHOOK_URL,
  },
  
  // AI configuration (using OpenAI)
  ai: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: `You are Jibby, a helpful AI assistant for a business. 
      Be friendly, professional, and concise in your responses. 
      If you don't know the answer to a question, offer to connect 
      the customer with a human representative.`,
  },
  
  // Webhook configuration
  webhook: {
    url: process.env.WEBHOOK_URL || '',
    secret: process.env.WEBHOOK_SECRET,
    events: ['message.received', 'message.sent', 'call.started', 'call.ended'],
  },
  
  // Rate limiting
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 60,
  },
  
  // Logging
  logging: {
    level: 'debug',
    format: 'text',
  },
};

// Create a new Jibby instance
const jibby = new Jibby(config);

// Event handlers
jibby.on('message', (message) => {
  console.log(`[${message.channel}] New message from ${message.sender}: ${message.content}`);
});

jibby.on('messageSent', (message) => {
  console.log(`[${message.channel}] Message sent to ${message.recipient}: ${message.content}`);
});

jibby.on('call', (call) => {
  console.log(`[VOICE] Incoming call from ${call.from} to ${call.to}`);
  // You can implement custom call handling logic here
});

jibby.on('error', (error) => {
  console.error('Jibby error:', error);
});

// Start the Jibby agent
async function startJibby() {
  try {
    // Initialize the agent
    await jibby.initialize();
    console.log('Jibby Agent Hub initialized');
    
    // Start the API server
    const port = parseInt(process.env.PORT || '3000', 10);
    await jibby.startServer(port);
    console.log(`Jibby API server running on port ${port}`);
    
    // Example: Send a welcome message to a new customer
    if (process.env.WHATSAPP_TEST_NUMBER) {
      await jibby.getService().sendMessage({
        channel: 'whatsapp',
        recipient: process.env.WHATSAPP_TEST_NUMBER,
        content: 'Hello! This is Jibby, your AI assistant. How can I help you today?',
        metadata: {
          source: 'welcome_flow',
        },
      });
    }
  } catch (error) {
    console.error('Failed to start Jibby:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function shutdown() {
  console.log('Shutting down Jibby...');
  try {
    await jibby.stop();
    console.log('Jibby has been stopped');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the application
startJibby();

// Example of sending a message programmatically
async function sendSampleMessage() {
  try {
    if (!process.env.WHATSAPP_TEST_NUMBER) {
      console.warn('No WhatsApp test number provided. Set WHATSAPP_TEST_NUMBER environment variable to test sending messages.');
      return;
    }
    
    console.log('Sending test message...');
    
    await jibby.getService().sendMessage({
      channel: 'whatsapp',
      recipient: process.env.WHATSAPP_TEST_NUMBER,
      content: 'This is a test message from the Jibby example.',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    });
    
    console.log('Test message sent successfully!');
  } catch (error) {
    console.error('Failed to send test message:', error);
  }
}

// Uncomment to test sending a message after a delay
// setTimeout(sendSampleMessage, 5000);
