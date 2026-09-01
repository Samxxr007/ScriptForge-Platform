import { Router } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/project.service.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { requireProjectRole } from '../middleware/rbac.ts';

const router = Router();

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  type: z.string().optional(),
  template: z.string().optional(),
  logline: z.string().optional(),
  genre: z.string().optional(),
  visualStyle: z.string().optional(),
  targetAudience: z.string().optional(),
});

// List all projects for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const projects = await ProjectService.listUserProjects(req.user!.id);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

// Create new project
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await ProjectService.createProject(req.user!.id, data);
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

// Get project by ID
router.get('/:id', authenticate, requireProjectRole('VIEWER'), async (req: AuthRequest, res, next) => {
  try {
    const project = await ProjectService.getProjectById(req.params.id, req.user!.id);
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

// Update project
router.patch('/:id', authenticate, requireProjectRole('WRITER'), async (req: AuthRequest, res, next) => {
  try {
    const project = await ProjectService.updateProject(req.params.id, req.body);
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

// Delete project (OWNER only)
router.delete('/:id', authenticate, requireProjectRole('OWNER'), async (req: AuthRequest, res, next) => {
  try {
    await ProjectService.deleteProject(req.params.id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Add collaborator member
router.post('/:id/members', authenticate, requireProjectRole('OWNER'), async (req: AuthRequest, res, next) => {
  try {
    const { email, role } = req.body;
    const member = await ProjectService.addMember(req.params.id, email, role, req.user!.id);
    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
});

// Update member role
router.patch('/:id/members/:memberId', authenticate, requireProjectRole('OWNER'), async (req: AuthRequest, res, next) => {
  try {
    const { role } = req.body;
    const member = await ProjectService.updateMemberRole(req.params.id, req.params.memberId, role);
    res.json({ member });
  } catch (err) {
    next(err);
  }
});

// Remove member
router.delete('/:id/members/:memberId', authenticate, requireProjectRole('OWNER'), async (req: AuthRequest, res, next) => {
  try {
    await ProjectService.removeMember(req.params.id, req.params.memberId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
