import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_hackathon_super_secret_jwt_key_2026';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/google
 * Google OAuth login handler (or standard mock payload fallback for hackathon evaluation)
 */
router.post('/google', async (req, res) => {
  try {
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { institution: true, company: true },
    });

    if (!user) {
      // Find default institution if needed
      const defaultInst = await prisma.institution.findFirst();
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          role: role || null,
          institutionId: defaultInst ? defaultInst.id : null,
          aadhaarVerified: false,
        },
        include: { institution: true, company: true },
      });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Mapping of demo roles to specific demo user accounts
const DEMO_EMAILS = {
  student: 'alex.chen@student.nit.edu',
  recruiter: 'sarah@techcorp.com',
  institution: 'dean@nit.edu',
};

/**
 * POST /api/auth/demo-login
 * Fast demo login for hackathon testing without needing OAuth steps
 */
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body; // 'student', 'recruiter', 'institution'
    const targetEmail = DEMO_EMAILS[role];

    if (!targetEmail) {
      return res.status(400).json({ error: 'Invalid demo role requested' });
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { institution: true, company: true },
    });

    if (!user) {
      return res.status(404).json({ error: `Demo user for role '${role}' (${targetEmail}) not found` });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed' });
  }
});

/**
 * POST /api/auth/role
 * Assign user role on first login
 */
router.post('/role', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'recruiter', 'institution'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { role },
      include: { institution: true, company: true },
    });

    // If recruiter and no company exists yet, create default company
    if (role === 'recruiter' && !updatedUser.company) {
      await prisma.company.create({
        data: {
          name: `${updatedUser.name}'s Company`,
          recruiterId: updatedUser.id,
        },
      });
    }

    const token = generateToken(updatedUser);
    res.json({ token, user: updatedUser });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * POST /api/auth/aadhaar
 * Simulated Aadhaar Verification toggle/step
 */
router.post('/aadhaar', requireAuth, async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { aadhaarVerified: true },
      include: { institution: true, company: true },
    });

    res.json({ message: 'Aadhaar verified successfully (simulated)', user: updatedUser });
  } catch (error) {
    console.error('Aadhaar verification error:', error);
    res.status(500).json({ error: 'Aadhaar verification failed' });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user object
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
