import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import twilio from 'twilio';
import { prisma } from '..';
import { protect } from '../middleware/auth';

const router = Router();

// @route   POST /api/calls/make-call
// @desc    Make an outbound call using Twilio
// @access  Private
router.post('/make-call', protect, async (req, res) => {
  const { to, from: fromNumber } = req.body;

  if (!to) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Please provide a phone number to call',
    });
  }

  try {
    // Get Twilio credentials from database
    const twilioIntegration = await prisma.integration.findUnique({
      where: { provider: 'twilio' },
    });

    if (!twilioIntegration) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Twilio integration not configured',
      });
    }

    const { accountSid, authToken, phoneNumber: twilioNumber } = twilioIntegration;
    const client = twilio(accountSid, authToken);

    // Make the call using Twilio
    const call = await client.calls.create({
      to: to.startsWith('+') ? to : `+${to}`,
      from: fromNumber || twilioNumber,
      url: 'http://demo.twilio.com/docs/voice.xml', // This is a demo URL, replace with your TwiML URL
    });

    // Log the call in the database
    const callLog = await prisma.callLog.create({
      data: {
        fromNumber: fromNumber || twilioNumber,
        toNumber: to,
        status: call.status,
      },
    });

    res.json({
      message: 'Call initiated',
      callSid: call.sid,
      status: call.status,
      callLogId: callLog.id,
    });
  } catch (error) {
    console.error('Error making call:', error);
    
    // More specific error handling for Twilio errors
    if (error.code === 21211) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid phone number format',
      });
    }
    
    if (error.code === 21408) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Calling is not enabled for your account',
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to initiate call',
      details: error.message,
    });
  }
});

// @route   GET /api/calls/history
// @desc    Get call history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const calls = await prisma.callLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent calls
    });
    
    res.json(calls);
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch call history',
    });
  }
});

export default router;
