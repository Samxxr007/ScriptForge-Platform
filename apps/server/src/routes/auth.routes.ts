import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleTitle: z.string().optional(),
  preferredType: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await AuthService.register(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/onboarding', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await AuthService.updateOnboarding(req.user!.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
