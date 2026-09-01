import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// List user notifications
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

// Mark single notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

// Mark all as read
router.post('/read-all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Activity feed for a project
router.get('/activity/:projectId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { projectId: req.params.projectId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });
    res.json({ activities });
  } catch (err) {
    next(err);
  }
});

export default router;
