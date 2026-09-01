import { Router } from 'express';
import { AIService } from '../services/ai.service.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { prisma } from '../db.js';

const router = Router();

// Log AI Request helper
async function logAI(userId: string, projectId: string | undefined, action: string, prompt: string, response: string) {
  try {
    await prisma.aIRequest.create({
      data: {
        userId,
        projectId,
        action,
        prompt: prompt.slice(0, 500),
        response: typeof response === 'object' ? JSON.stringify(response).slice(0, 1000) : response.slice(0, 1000),
        model: 'groq/llama-3.3-70b-versatile',
      },
    });
  } catch (e) {
    console.error('Failed to log AI request:', e);
  }
}

// 1. Story Studio (Idea -> Full Story / Acts / Characters / Screenplay)
router.post('/story-studio', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { prompt, mode, projectId } = req.body;
    const result = await AIService.generateStory(prompt, mode);
    await logAI(req.user!.id, projectId, 'STORY_STUDIO', prompt, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 2. Direct This Scene
router.post('/direct-scene', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sceneContent, sceneTitle, projectId } = req.body;
    const result = await AIService.directScene(sceneContent, sceneTitle);
    await logAI(req.user!.id, projectId, 'DIRECT_SCENE', sceneTitle, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 3. Cinematographer Advice
router.post('/cinematographer', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sceneContent, instruction, projectId } = req.body;
    const result = await AIService.cinematographerAdvice(sceneContent, instruction);
    await logAI(req.user!.id, projectId, 'CINEMATOGRAPHER', instruction, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 4. Generate Shot List
router.post('/shot-list', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sceneContent, sceneTitle, projectId } = req.body;
    const shots = await AIService.generateShotList(sceneContent, sceneTitle);
    await logAI(req.user!.id, projectId, 'SHOT_LIST', sceneTitle, JSON.stringify(shots));
    res.json({ shots });
  } catch (err) {
    next(err);
  }
});

// 5. Continue Writing
router.post('/continue', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { selectedText, sceneContext, characterContext, projectId } = req.body;
    const text = await AIService.continueWriting(selectedText || '', sceneContext || '', characterContext || '');
    await logAI(req.user!.id, projectId, 'CONTINUE', selectedText || '', text);
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

// 6. Improve Dialogue
router.post('/dialogue', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { dialogueText, characterName, characterTraits, projectId } = req.body;
    const text = await AIService.improveDialogue(dialogueText, characterName, characterTraits);
    await logAI(req.user!.id, projectId, 'DIALOGUE', dialogueText, text);
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

// 7. Rewrite Text
router.post('/rewrite', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { text, mode, projectId } = req.body;
    const result = await AIService.rewriteText(text, mode);
    await logAI(req.user!.id, projectId, 'REWRITE', mode, result);
    res.json({ text: result });
  } catch (err) {
    next(err);
  }
});

// 8. Brainstorm
router.post('/brainstorm', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { topic, type, projectContext, projectId } = req.body;
    const ideas = await AIService.brainstorm(topic, type, projectContext);
    await logAI(req.user!.id, projectId, 'BRAINSTORM', topic, ideas);
    res.json({ text: ideas });
  } catch (err) {
    next(err);
  }
});

// 9. Health & Coverage Analysis
router.post('/health-check', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { content, characters, projectId } = req.body;
    const health = await AIService.analyzeScreenplayHealth(content, characters);
    await logAI(req.user!.id, projectId, 'HEALTH_CHECK', 'Health Analysis', JSON.stringify(health));
    res.json(health);
  } catch (err) {
    next(err);
  }
});

// 10. Continuity Scanner
router.post('/continuity', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { content, characters, projectId } = req.body;
    const issues = await AIService.checkContinuity(content, characters);
    await logAI(req.user!.id, projectId, 'CONTINUITY', 'Continuity Check', JSON.stringify(issues));
    res.json({ issues });
  } catch (err) {
    next(err);
  }
});

// AI Request History
router.get('/history/:projectId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const history = await prisma.aIRequest.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

export default router;
