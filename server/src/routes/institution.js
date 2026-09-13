import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/institution/stats
 * Aggregate skill stats for institution dashboard (e.g. Pending, Claimed, Verified counts, and Level >= 2)
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
      let pendingCount = 0;
      let claimedCount = 0;
      let verifiedCount = 0;
      let level2PlusCount = 0;

      students.forEach((student) => {
        const ss = student.studentSkills.find((item) => item.skillId === skill.id);
        if (ss) {
          if (ss.status === 'pending') pendingCount += 1;
          else if (ss.status === 'claimed') claimedCount += 1;
          else if (ss.status === 'verified') verifiedCount += 1;

          if (ss.level >= 2) {
            level2PlusCount += 1;
          }
        }
      });

      return {
        skillId: skill.id,
        skillName: skill.name,
        pendingCount,
        claimedCount,
        verifiedCount,
        totalWithSkill: pendingCount + claimedCount + verifiedCount,
        level2PlusCount,
      };
    });

    // Rank top students by verified skills count
    const studentPerformance = students
      .map((student) => {
        const verifiedSkills = student.studentSkills.filter((ss) => ss.status === 'verified').length;
        const claimedSkills = student.studentSkills.filter((ss) => ss.status === 'claimed').length;
        const pendingSkills = student.studentSkills.filter((ss) => ss.status === 'pending').length;
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          aadhaarVerified: student.aadhaarVerified,
          verifiedSkillsCount: verifiedSkills,
          claimedSkillsCount: claimedSkills,
          pendingSkillsCount: pendingSkills,
          skills: student.studentSkills.map((ss) => ({
            id: ss.skill.id,
            name: ss.skill.name,
            status: ss.status,
            level: ss.level,
          })),
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

/**
 * GET /api/institution/candidates (or candidate pool for recruiters & institutions)
 * Allows candidate search & filtering by skill, min level, and status
 */
router.get('/candidates', requireAuth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'recruiter' && role !== 'institution') {
      return res.status(403).json({ error: 'Access denied: Candidate search requires recruiter or institution role' });
    }

    const { skillId, minLevel, status, search } = req.query;

    const students = await prisma.user.findMany({
      where: {
        role: 'student',
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        studentSkills: {
          include: { skill: true },
        },
      },
    });

    let filteredStudents = students;

    if (skillId) {
      filteredStudents = filteredStudents.filter((st) => {
        return st.studentSkills.some((ss) => {
          if (ss.skillId !== skillId) return false;
          if (minLevel && ss.level < Number(minLevel)) return false;
          if (status && ss.status !== status) return false;
          return true;
        });
      });
    } else if (minLevel) {
      filteredStudents = filteredStudents.filter((st) => {
        return st.studentSkills.some((ss) => ss.level >= Number(minLevel));
      });
    } else if (status) {
      filteredStudents = filteredStudents.filter((st) => {
        return st.studentSkills.some((ss) => ss.status === status);
      });
    }

    const result = filteredStudents.map((student) => {
      const verifiedSkills = student.studentSkills.filter((ss) => ss.status === 'verified');
      const claimedSkills = student.studentSkills.filter((ss) => ss.status === 'claimed');
      const pendingSkills = student.studentSkills.filter((ss) => ss.status === 'pending');

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        aadhaarVerified: student.aadhaarVerified,
        verifiedSkillsCount: verifiedSkills.length,
        claimedSkillsCount: claimedSkills.length,
        pendingSkillsCount: pendingSkills.length,
        studentSkills: student.studentSkills.map((ss) => ({
          skillId: ss.skillId,
          skillName: ss.skill.name,
          status: ss.status,
          level: ss.level,
        })),
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Fetch candidate pool error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate pool' });
  }
});

export default router;
