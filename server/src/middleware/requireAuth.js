import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    const decoded = jwt.verify(token, secret);
    
    // Fetch fresh user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { institution: true, company: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}
