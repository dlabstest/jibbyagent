# Jibby Agent Hub

Jibby is an AI-powered agent hub designed for business communications and automation. It provides a unified interface for handling customer interactions across multiple channels including voice calls, WhatsApp, and more.

## Features

- **Multi-channel Communication**: Handle customer interactions across voice calls and messaging platforms
- **AI-Powered Responses**: Integrated with leading AI providers for intelligent conversation handling
- **REST API**: Easy integration with existing systems and applications
- **Real-time Updates**: WebSocket support for live call status and messaging
- **Extensible Architecture**: Easily add new communication channels and AI providers
- **Call Management**: Make, receive, and manage voice calls with Twilio integration

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT
- **Voice Services**: Twilio

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Twilio Account (for voice calls)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dlabstest/jibbyagent.git
   cd jibbyagent
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Create `.env` files in both `server` and `client` directories
   
   Example `.env` for server:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Database
   DATABASE_URL="file:./dev.db"
   
   # JWT Secret
   JWT_SECRET=your_secure_jwt_secret_here
   
   # Twilio Configuration (for voice calls)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

## Running the Application

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. In a new terminal, start the client:
   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Documentation

### Authentication
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/user` - Get current user information

### Integrations
- `GET /api/integrations/twilio` - Get Twilio integration details
- `POST /api/integrations/twilio` - Configure Twilio integration

### Calls
- `POST /api/calls/make-call` - Initiate a new call
- `GET /api/calls/history` - Get call history

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 3001 | No |
| NODE_ENV | Environment mode | development | No |
| DATABASE_URL | Database connection URL | file:./dev.db | No |
| JWT_SECRET | Secret for JWT signing | - | Yes |
| TWILIO_ACCOUNT_SID | Twilio Account SID | - | For voice calls |
| TWILIO_AUTH_TOKEN | Twilio Auth Token | - | For voice calls |
| TWILIO_PHONE_NUMBER | Twilio Phone Number | - | For voice calls |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
npm run dev

# Start in production mode
npm run build
npm start
```

### Basic Example

```typescript
import { Jibby } from '@jibby/agent-hub';

// Create a new Jibby instance
const jibby = new Jibby({
  name: 'My Business Agent',
  whatsApp: {
    enabled: true,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumberId: process.env.TWILIO_PHONE_NUMBER,
  },
  ai: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
  },
});

// Start the agent hub
await jibby.initialize();

// Start the API server
await jibby.startServer(3000);

console.log('Jibby Agent Hub is running on port 3000');
```

### API Endpoints

#### Send a Message

```http
POST /api/v1/messages
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "channel": "whatsapp",
  "recipient": "+1234567890",
  "content": "Hello from Jibby!",
  "metadata": {
    "priority": "high"
  }
}
```

#### Get Conversation History

```http
GET /api/v1/conversations/{conversationId}
Authorization: Bearer your_jwt_token
```

## Webhooks

Jibby can send webhook notifications for various events. Configure webhook URLs in your agent configuration:

```typescript
const jibby = new Jibby({
  // ... other config
  webhook: {
    url: 'https://your-webhook-url.com/jibby-events',
    secret: 'your_webhook_secret',
    events: ['message.received', 'message.sent', 'call.started', 'call.ended']
  }
});
```

## Integrations

### WhatsApp

To enable WhatsApp messaging, you'll need:
1. A Twilio account
2. A Twilio WhatsApp-enabled phone number
3. Configure the webhook URL in your Twilio console to point to `https://your-jibby-instance.com/webhook/whatsapp`

### Voice Calls

Jibby supports voice calls through Twilio. Configure your Twilio phone number's voice webhook to point to `https://your-jibby-instance.com/webhook/voice`

### AI Providers

Jibby supports multiple AI providers for natural language processing:

- **OpenAI** (default): Supports GPT-3.5, GPT-4, and other OpenAI models
- **Anthropic**: Support for Claude models (coming soon)
- **Custom**: Implement your own AI provider

## Development

### Prerequisites

- Node.js 18+
- npm 8+
- TypeScript 4.9+

### Building

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

Jibby can be deployed to any Node.js hosting platform. Here's an example for deploying to Heroku:

```bash
# Create a new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set OPENAI_API_KEY=your_openai_api_key
# ... set other environment variables

# Deploy to Heroku
git push heroku main
```

## License

MIT

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## Support

For support, please open an issue on our [GitHub repository](https://github.com/your-org/jibby/issues).
