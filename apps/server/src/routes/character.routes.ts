import { Router } from 'express';
import { CharacterService } from '../services/character.service.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

router.get('/project/:projectId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const characters = await CharacterService.listCharacters(req.params.projectId);
    res.json({ characters });
  } catch (err) {
    next(err);
  }
});

router.post('/project/:projectId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const character = await CharacterService.createCharacter(req.params.projectId, req.body);
    res.status(201).json({ character });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const character = await CharacterService.updateCharacter(req.params.id, req.body);
    res.json({ character });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await CharacterService.deleteCharacter(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
