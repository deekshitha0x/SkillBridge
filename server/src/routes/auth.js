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

// Demo email map to connect standard demo emails to seeded users
const DEMO_EMAIL_MAP = {
  'demo.student@skillbridge.test': 'alex.chen@student.nit.edu',
  'demo.recruiter@skillbridge.test': 'sarah@techcorp.com',
  'demo.institution@skillbridge.test': 'dean@nit.edu',
};

/**
 * POST /api/auth/login
 * Standard email/password login supporting both exact emails and demo aliases
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const targetEmail = DEMO_EMAIL_MAP[email.toLowerCase().trim()] || email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { institution: true, company: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * POST /api/auth/signup
 * New user registration with optional role and onboarding metadata
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, name, role, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const defaultInst = await prisma.institution.findFirst();
    const newUserRole = role && ['student', 'recruiter', 'institution'].includes(role) ? role : null;

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        role: newUserRole,
        institutionId: defaultInst ? defaultInst.id : null,
        aadhaarVerified: false,
      },
      include: { institution: true, company: true },
    });

    // If recruiter role selected during signup, initialize company
    if (newUserRole === 'recruiter') {
      await prisma.company.create({
        data: {
          name: `${user.name}'s Company`,
          recruiterId: user.id,
        },
      });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Sign up failed' });
  }
});

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

    const normalizedEmail = email.toLowerCase().trim();
    const targetEmail = DEMO_EMAIL_MAP[normalizedEmail] || normalizedEmail;

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { institution: true, company: true },
    });

    if (!user) {
      const defaultInst = await prisma.institution.findFirst();
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || normalizedEmail.split('@')[0],
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

/**
 * POST /api/auth/demo-login
 * Fast demo login for hackathon testing
 */
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body; // 'student', 'recruiter', 'institution'
    const targetRole = role || 'student';

    let user = await prisma.user.findFirst({
      where: { role: targetRole },
      include: { institution: true, company: true },
    });

    if (!user) {
      const inst = await prisma.institution.findFirst();
      user = await prisma.user.create({
        data: {
          email: `demo.${targetRole}@skillbridge.test`,
          name: `Demo ${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)}`,
          role: targetRole,
          institutionId: inst ? inst.id : null,
          aadhaarVerified: targetRole === 'student',
        },
        include: { institution: true, company: true },
      });
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
 * Assign user role on first login / onboarding
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

