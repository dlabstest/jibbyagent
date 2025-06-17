import { Typography, Box, Paper } from '@mui/material';

const Analytics = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Paper sx={{ p: 3, minHeight: '70vh' }}>
        <Typography color="text.secondary">
          Your analytics and reports will appear here. Track performance and metrics.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Analytics;
