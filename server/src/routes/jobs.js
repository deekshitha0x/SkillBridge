import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { getSimilarJobs } from '../lib/matching.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/jobs
 * Get list of all jobs with company info and challenges count
 */
router.get('/', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        challenges: {
          select: { id: true, title: true, difficultyLevel: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Fetch jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * GET /api/jobs/:id
 * Get single job detail with required skills + similar jobs recommendation
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        challenges: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    // Call rule-based matching function for similar jobs
    const similarJobs = await getSimilarJobs(id);

    res.json({
      job,
      similarJobs,
    });
  } catch (error) {
    console.error('Fetch job detail error:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

/**
 * POST /api/jobs
 * Create new job posting (Recruiter only)
 */
router.post('/', requireAuth, requireRole('recruiter'), async (req, res) => {
  try {
    const { title, description, requiredSkills } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Ensure recruiter has a company record
    let company = req.user.company;
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: `${req.user.name}'s Company`,
          recruiterId: req.user.id,
        },
      });
    }

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title,
        description,
        requiredSkills: requiredSkills || [],
      },
      include: {
        company: true,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job posting' });
  }
});

export default router;
