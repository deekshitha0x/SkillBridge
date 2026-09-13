import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/institution/stats
 * Aggregate skill stats for institution dashboard (e.g. X claimed Python, Y verified, Z >= level 2)
 */
router.get('/stats', requireAuth, requireRole('institution'), async (req, res) => {
  try {
    const institutionId = req.user.institutionId;

    const institution = await prisma.institution.findFirst({
      where: institutionId ? { id: institutionId } : {},
    });

    const targetInstId = institution ? institution.id : null;

    // Fetch all students belonging to this institution (or all students if none specified)
    const students = await prisma.user.findMany({
      where: targetInstId ? { role: 'student', institutionId: targetInstId } : { role: 'student' },
      include: {
        studentSkills: {
          include: { skill: true },
        },
      },
    });

    const totalStudents = students.length;
    const aadhaarVerifiedStudents = students.filter((s) => s.aadhaarVerified).length;

    // Aggregate by Skill
    const allSkills = await prisma.skill.findMany();
    
    const skillStats = allSkills.map((skill) => {
      let claimedCount = 0;
      let verifiedCount = 0;
      let level2PlusCount = 0;

      students.forEach((student) => {
        const ss = student.studentSkills.find((item) => item.skillId === skill.id);
        if (ss) {
          claimedCount += 1;
          if (ss.status === 'verified') {
            verifiedCount += 1;
          }
          if (ss.level >= 2) {
            level2PlusCount += 1;
          }
        }
      });

      return {
        skillId: skill.id,
        skillName: skill.name,
        claimedCount,
        verifiedCount,
        level2PlusCount,
      };
    });

    // Rank top students by verified skills count
    const studentPerformance = students
      .map((student) => {
        const verifiedSkills = student.studentSkills.filter((ss) => ss.status === 'verified').length;
        const claimedSkills = student.studentSkills.filter((ss) => ss.status === 'claimed').length;
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          aadhaarVerified: student.aadhaarVerified,
          verifiedSkillsCount: verifiedSkills,
          claimedSkillsCount: claimedSkills,
        };
      })
      .sort((a, b) => b.verifiedSkillsCount - a.verifiedSkillsCount);

    res.json({
      institution: institution || { name: 'All Partner Institutions' },
      totalStudents,
      aadhaarVerifiedStudents,
      aadhaarVerificationRate: totalStudents > 0 ? Math.round((aadhaarVerifiedStudents / totalStudents) * 100) : 0,
      skillStats,
      topStudents: studentPerformance.slice(0, 10),
    });
  } catch (error) {
    console.error('Fetch institution stats error:', error);
    res.status(500).json({ error: 'Failed to aggregate institution stats' });
  }
});

export default router;
