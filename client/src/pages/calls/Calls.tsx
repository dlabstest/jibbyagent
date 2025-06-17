import { Typography, Box, Paper } from '@mui/material';

const Calls = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Call History
      </Typography>
      <Paper sx={{ p: 3, minHeight: '70vh' }}>
        <Typography color="text.secondary">
          Your call history will appear here. View details of past calls and recordings.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Calls;
