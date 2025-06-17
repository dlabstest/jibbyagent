import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // In a real app, you would validate the password against a hashed version in the database
    // For demo purposes, we'll accept any credentials
    
    // Create JWT payload
    const payload = {
      user: {
        id: 'demo-user',
        email: email || 'demo@example.com'
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', (req: AuthRequest, res) => {
  try {
    // Return user data without sensitive information
    res.json({
      id: req.user?.id,
      email: req.user?.email,
    });
  } catch (err) {
    console.error(err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
});

export default router;
