import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { prisma } from '../db.js';

export type ProjectRole = 'OWNER' | 'WRITER' | 'EDITOR' | 'VIEWER';

const roleHierarchy: Record<ProjectRole, number> = {
  OWNER: 4,
  WRITER: 3,
  EDITOR: 2,
  VIEWER: 1,
};

export const requireProjectRole = (minimumRole: ProjectRole) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required' });
      }

      const projectId = req.params.projectId || req.params.id || req.body.projectId;

      if (!projectId) {
        return res.status(400).json({ error: 'Bad Request: Project ID not found in request parameters' });
      }

      // Check if user is owner of project or a member with sufficient role
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            where: { userId: req.user.id },
          },
        },
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (project.ownerId === req.user.id) {
        return next(); // Owner has full permissions
      }

      const member = project.members[0];
      if (!member) {
        return res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      }

      const userRoleRank = roleHierarchy[member.role as ProjectRole] || 0;
      const requiredRank = roleHierarchy[minimumRole];

      if (userRoleRank < requiredRank) {
        return res.status(403).json({
          error: `Forbidden: This action requires at least ${minimumRole} role`,
        });
      }

      next();
    } catch (error) {
      console.error('RBAC error:', error);
      return res.status(500).json({ error: 'Internal server error evaluating permissions' });
    }
  };
};
