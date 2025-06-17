import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  IconButton, 
  Typography, 
  Divider, 
  Button, 
  Toolbar,
  TextField,
  MenuItem,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Phone, 
  Chat, 
  Facebook, 
  Twitter, 
  WhatsApp,
  Call,
  CallEnd,
  Dialpad,
  KeyboardArrowDown,
  Save as SaveIcon
} from '@mui/icons-material';
import { callsAPI } from '../../services/api';

type CallStatus = 'idle' | 'ringing' | 'in-progress';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

const AgentHub = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callTime, setCallTime] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isHandoverRequested, setIsHandoverRequested] = useState(false);
  const [agentMode, setAgentMode] = useState<'autonomous' | 'manual' | 'hybrid'>('autonomous');
  const [isCalling, setIsCalling] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' | 'info' | 'warning' 
  }>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  
  // Timer effect for active calls
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callStatus === 'in-progress') {
      interval = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [callStatus]);
  
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  const countryCodes: CountryCode[] = [
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  ];
  
  const handleDialPadClick = (value: string) => {
    setPhoneNumber(prev => prev + value);
  };
  
  const handleCall = async () => {
    if (!phoneNumber) {
      showSnackbar('Please enter a phone number', 'error');
      return;
    }
    
    try {
      setIsCalling(true);
      setCallStatus('ringing');
      
      const response = await callsAPI.makeCall({
        to: phoneNumber,
        // You can add 'from' if you want to specify a different number than the default
      });
      
      setCallStatus('in-progress');
      showSnackbar('Call connected!', 'success');
    } catch (error: any) {
      console.error('Failed to make call:', error);
      setCallStatus('idle');
      showSnackbar(error?.response?.data?.error || 'Failed to make call', 'error');
    } finally {
      setIsCalling(false);
    }
  };
  
  const handleEndCall = () => {
    setCallStatus('idle');
    setCallTime(0);
    // In a real app, you would also end the call via Twilio API
    showSnackbar('Call ended', 'info');
  };

  const handleHandover = () => {
    setIsHandoverRequested(true);
    console.log('Call handover requested');
  };

  // Format call time for display
  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Agent Hub
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button
              variant={agentMode === 'autonomous' ? 'contained' : 'outlined'}
              color="inherit"
              size="small"
              onClick={() => setAgentMode('autonomous')}
              sx={{
                textTransform: 'none',
                bgcolor: agentMode === 'autonomous' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              Autonomous Mode
            </Button>
            <Button
              variant={agentMode === 'hybrid' ? 'contained' : 'outlined'}
              color="inherit"
              size="small"
              onClick={() => setAgentMode('hybrid')}
              sx={{
                textTransform: 'none',
                bgcolor: agentMode === 'hybrid' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              Hybrid Mode
            </Button>
            <Button
              variant={agentMode === 'manual' ? 'contained' : 'outlined'}
              color="inherit"
              size="small"
              onClick={() => setAgentMode('manual')}
              sx={{
                textTransform: 'none',
                bgcolor: agentMode === 'manual' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              Manual Mode
            </Button>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Status: <span style={{ color: '#4caf50' }}>Connected</span>
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
      
      <Paper sx={{ height: '100%', p: 2, display: 'flex', gap: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', p: 2 }}>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab icon={<Phone />} label="Voice Call" />
            <Tab icon={<WhatsApp />} label="WhatsApp" />
            <Tab icon={<Chat />} label="Live Chat" />
            <Tab icon={<Facebook />} label="Facebook" />
            <Tab icon={<Twitter />} label="Twitter" />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 3, mb: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 0 && (
              <Box sx={{ textAlign: 'center', my: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  {callStatus === 'idle' && 'Ready to make a call'}
                  {callStatus === 'ringing' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <span>Calling {phoneNumber}...</span>
                    </Box>
                  )}
                  {callStatus === 'in-progress' && (
                    <Box sx={{ textAlign: 'center' }}>
                      <div>Call in progress</div>
                      <Typography variant="h5" color="primary">
                        {formatCallTime(callTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {phoneNumber}
                      </Typography>
                    </Box>
                  )}
                </Typography>

                {/* Number Display */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 3, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    maxWidth: 400,
                    mx: 'auto',
                    width: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      variant="standard"
                      sx={{ minWidth: 100, mr: 1 }}
                      SelectProps={{
                        IconComponent: KeyboardArrowDown,
                      }}
                    >
                      {countryCodes.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      InputProps={{
                        disableUnderline: true,
                        style: { fontSize: '1.5rem' },
                        endAdornment: phoneNumber && (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setPhoneNumber('')} size="small">
                              ✕
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Dial Pad */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 1,
                    '& button': {
                      aspectRatio: '1',
                      minWidth: 'auto',
                      fontSize: '1.5rem',
                      borderRadius: '50%',
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                    }
                  }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
                      <Button 
                        key={num} 
                        variant="outlined"
                        onClick={() => handleDialPadClick(num.toString())}
                      >
                        {num}
                      </Button>
                    ))}
                  </Box>
                </Paper>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 2, 
                  mt: 2,
                  '& > *': {
                    width: 56,
                    height: 56,
                    '&.call-button': {
                      width: 64,
                      height: 64,
                    }
                  }
                }}>
                  <IconButton
                    color={isSpeakerOn ? 'primary' : 'default'}
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Phone sx={{ transform: 'rotate(-45deg)' }} />
                  </IconButton>
                  
                  <IconButton
                    color={callStatus === 'in-progress' ? 'error' : 'primary'}
                    onClick={callStatus === 'idle' ? handleCall : handleEndCall}
                    sx={{
                      bgcolor: callStatus === 'in-progress' ? 'error.main' : 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: callStatus === 'in-progress' ? 'error.dark' : 'primary.dark',
                      },
                      '&.call-button': {
                        width: 64,
                        height: 64,
                      },
                      '&:disabled': {
                        bgcolor: 'action.disabledBackground',
                        color: 'action.disabled',
                      }
                    }}
                    className="call-button"
                    disabled={isCalling || !phoneNumber}
                  >
                    {isCalling && callStatus === 'ringing' ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : callStatus === 'in-progress' ? (
                      <CallEnd />
                    ) : (
                      <Call />
                    )}
                  </IconButton>

                  <IconButton
                    onClick={handleHandover}
                    disabled={callStatus !== 'in-progress' || isHandoverRequested}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5
                      }
                    }}
                  >
                    <Dialpad />
                  </IconButton>
                </Box>
                
                {isHandoverRequested && (
                  <Typography color="secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Notifying manager for handover...
                  </Typography>
                )}

                {isHandoverRequested && (
                  <Typography color="secondary" sx={{ mt: 2 }}>
                    Notifying manager for handover...
                  </Typography>
                )}
              </Box>
            )}

            {activeTab !== 0 && (
              <Box sx={{ textAlign: 'center', my: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  {activeTab === 1 && 'WhatsApp Chat'}
                  {activeTab === 2 && 'Live Chat'}
                  {activeTab === 3 && 'Facebook Messenger'}
                  {activeTab === 4 && 'Twitter DM'}
                </Typography>
                <Typography color="text.secondary">
                  Chat interface will be displayed here
                </Typography>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleHandover}
                  sx={{ mt: 2 }}
                >
                  Hand Over to Manager
                </Button>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="body2" color="text.secondary">
              Current Mode: <strong>{agentMode.charAt(0).toUpperCase() + agentMode.slice(1)}</strong>
            </Typography>
          </Paper>
        </Box>
      </Paper>
      </Box>
    </Box>
  );
};

export default AgentHub;
