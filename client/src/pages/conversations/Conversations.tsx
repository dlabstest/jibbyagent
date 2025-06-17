import { Typography, Box, Paper } from '@mui/material';

const Conversations = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Conversations
      </Typography>
      <Paper sx={{ p: 3, minHeight: '70vh' }}>
        <Typography color="text.secondary">
          Your conversation history will appear here. Select a conversation to view messages.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Conversations;
