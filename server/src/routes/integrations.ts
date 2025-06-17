import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '..';
import { protect } from '../middleware/auth';

const router = Router();

// @route   GET /api/integrations/twilio
// @desc    Get Twilio integration details
// @access  Private
router.get('/twilio', protect, async (req, res) => {
  try {
    const integration = await prisma.integration.findUnique({
      where: { provider: 'twilio' },
    });

    if (!integration) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Twilio integration not found',
      });
    }

    // Don't send the auth token back to the client
    const { authToken, ...integrationData } = integration;
    
    res.json(integrationData);
  } catch (error) {
    console.error('Error fetching Twilio integration:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch Twilio integration',
    });
  }
});

// @route   POST /api/integrations/twilio
// @desc    Create or update Twilio integration
// @access  Private
router.post('/twilio', protect, async (req, res) => {
  const { accountSid, authToken, phoneNumber } = req.body;

  if (!accountSid || !authToken || !phoneNumber) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Please provide accountSid, authToken, and phoneNumber',
    });
  }

  try {
    const integration = await prisma.integration.upsert({
      where: { provider: 'twilio' },
      update: {
        accountSid,
        authToken,
        phoneNumber,
      },
      create: {
        provider: 'twilio',
        accountSid,
        authToken,
        phoneNumber,
      },
    });

    // Don't send the auth token back to the client
    const { authToken: _, ...integrationData } = integration;
    
    res.status(StatusCodes.CREATED).json(integrationData);
  } catch (error) {
    console.error('Error saving Twilio integration:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save Twilio integration',
    });
  }
});

export default router;
