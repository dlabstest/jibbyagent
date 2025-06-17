import { Typography, Box, Paper } from '@mui/material';

const Contacts = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Contacts
      </Typography>
      <Paper sx={{ p: 3, minHeight: '70vh' }}>
        <Typography color="text.secondary">
          Your contacts will appear here. Manage and organize your contacts.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Contacts;
