import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  styled,
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Create custom grid components
const GridContainer = styled('div')({
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(12, 1fr)',
  width: '100%',
});

const GridItem = styled('div')(({ theme }) => ({
  gridColumn: 'span 12',
  [theme.breakpoints.up('sm')]: {
    gridColumn: 'span 6',
  },
}));

const GridItemFull = styled('div')({
  gridColumn: '1 / -1',
});

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface IntegrationCardProps {
  title: string;
  icon: React.ElementType;
  description: string;
  children: React.ReactNode;
  isConnected?: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  title,
  icon: Icon,
  description,
  children,
  isConnected = false
}) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: isConnected ? 'success.main' : 'grey.300', mr: 2 }}>
          <Icon />
        </Avatar>
        <Box>
          <Typography variant="h6" component="div">
            {title}
            {isConnected && (
              <Typography 
                variant="caption" 
                color="success.main" 
                sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}
              >
                <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                Connected
              </Typography>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
      {children}
    </CardContent>
  </Card>
);

const Integrations = () => {
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isAIIntegrationEnabled, setIsAIIntegrationEnabled] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSaveTwilio = () => {
    // Here you would typically make an API call to save the Twilio credentials
    setSnackbar({
      open: true,
      message: 'Twilio settings saved successfully!',
      severity: 'success',
    });
  };

  const handleSaveOpenAI = () => {
    // Here you would typically make an API call to save the OpenAI API key
    setSnackbar({
      open: true,
      message: 'OpenAI API key saved successfully!',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Integrations
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Connect and configure third-party services to enhance Jibby Hub's capabilities.
      </Typography>

      {/* Twilio Integration */}
      <IntegrationCard
        title="Twilio"
        icon={PhoneIcon}
        description="Connect your Twilio account to enable WhatsApp and Voice capabilities"
        isConnected={!!twilioSid && !!twilioToken}
      >
        <GridContainer>
          <GridItem>
            <TextField
              fullWidth
              label="Account SID"
              value={twilioSid}
              onChange={(e) => setTwilioSid(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            />
          </GridItem>
          <GridItem>
            <TextField
              fullWidth
              label="Auth Token"
              type="password"
              value={twilioToken}
              onChange={(e) => setTwilioToken(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Your Twilio Auth Token"
            />
          </GridItem>
          <GridItem>
            <TextField
              fullWidth
              label="Twilio Phone Number"
              value={twilioPhone}
              onChange={(e) => setTwilioPhone(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="+1234567890"
            />
          </GridItem>
          <GridItemFull>
            <FormControlLabel
              control={
                <Switch
                  checked={isWhatsAppEnabled}
                  onChange={(e) => setIsWhatsAppEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable WhatsApp Integration"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isVoiceEnabled}
                  onChange={(e) => setIsVoiceEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Voice Integration"
              sx={{ ml: 2 }}
            />
          </GridItemFull>
          <GridItemFull>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveTwilio}
              disabled={!twilioSid || !twilioToken}
            >
              Save Twilio Settings
            </Button>
          </GridItemFull>
        </GridContainer>
      </IntegrationCard>

      {/* OpenAI Integration */}
      <IntegrationCard
        title="OpenAI"
        icon={SettingsIcon}
        description="Connect your OpenAI account to enable AI-powered responses and automation"
        isConnected={!!openAIKey}
      >
        <GridContainer>
          <GridItemFull>
            <TextField
              fullWidth
              label="OpenAI API Key"
              type="password"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            />
          </GridItemFull>
          <GridItemFull>
            <FormControlLabel
              control={
                <Switch
                  checked={isAIIntegrationEnabled}
                  onChange={(e) => setIsAIIntegrationEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable AI Integration"
            />
          </GridItemFull>
          <GridItemFull>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveOpenAI}
              disabled={!openAIKey}
            >
              Save OpenAI Settings
            </Button>
          </GridItemFull>
        </GridContainer>
      </IntegrationCard>

      {/* Webhook Configuration */}
      <IntegrationCard
        title="Webhooks"
        icon={SettingsIcon}
        description="Configure webhook endpoints for receiving real-time updates"
      >
        <Typography variant="body2" color="text.secondary" paragraph>
          Your webhook URL for receiving events:
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
          <code>
            {window.location.origin}/api/webhook
          </code>
        </Paper>
        <Typography variant="body2" color="text.secondary">
          Configure this URL in your Twilio console to receive webhook events.
        </Typography>
      </IntegrationCard>

      {/* API Documentation */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <SettingsIcon />
            </Avatar>
            <Typography variant="h6" component="div">
              API Documentation
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            For detailed API documentation and integration guides, please visit our API Reference.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => window.open('/api-docs', '_blank')}
          >
            View API Documentation
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Integrations;
