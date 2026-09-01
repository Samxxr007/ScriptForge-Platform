import { Router } from 'express';
import { ShotService } from '../services/shot.service.ts';
import { ImageGenerationProvider } from '../services/image.provider.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Shots
router.get('/scene/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const shots = await ShotService.listShotsForScene(req.params.sceneId);
    res.json({ shots });
  } catch (err) {
    next(err);
  }
});

router.post('/scene/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const shot = await ShotService.createShot(req.params.sceneId, req.body);
    res.status(201).json({ shot });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const shot = await ShotService.updateShot(req.params.id, req.body);
    res.json({ shot });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await ShotService.deleteShot(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Storyboard frame image generation
router.post('/:id/generate-frame', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const shot = await ShotService.updateShot(req.params.id, {});
    const frameResult = await ImageGenerationProvider.generateStoryboardFrame({
      shot: shot.shotType,
      lens: shot.lens,
      mood: req.body.mood || 'cinematic tension',
      lighting: req.body.lighting || 'low-key chiaroscuro',
      character: shot.characters || req.body.character || '',
      environment: req.body.environment || '',
      rawPrompt: req.body.prompt,
    });

    const updatedFrame = await ShotService.updateStoryboardFrame(req.params.id, {
      imageUrl: frameResult.imageUrl,
      prompt: frameResult.prompt,
      structuredPrompt: frameResult.structuredPrompt,
      status: 'GENERATED',
    });

    res.json({ storyboard: updatedFrame });
  } catch (err) {
    next(err);
  }
});

// Camera Setups (Previs)
router.get('/camera/scene/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const setups = await ShotService.getCameraSetups(req.params.sceneId);
    res.json({ cameraSetups: setups });
  } catch (err) {
    next(err);
  }
});

router.post('/camera/scene/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const setup = await ShotService.createCameraSetup(req.params.sceneId, req.body);
    res.status(201).json({ cameraSetup: setup });
  } catch (err) {
    next(err);
  }
});

router.patch('/camera/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const setup = await ShotService.updateCameraSetup(req.params.id, req.body);
    res.json({ cameraSetup: setup });
  } catch (err) {
    next(err);
  }
});

router.delete('/camera/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await ShotService.deleteCameraSetup(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Scene Layout (Top-Down Previs 3D/2.5D Canvas)
router.get('/layout/scene/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const layout = await ShotService.getSceneLayout(req.params.sceneId);
    res.json({ sceneLayout: layout });
  } catch (err) {
    next(err);
  }
});

router.patch('/layout/scene/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const layout = await ShotService.updateSceneLayout(req.params.sceneId, req.body);
    res.json({ sceneLayout: layout });
  } catch (err) {
    next(err);
  }
});

export default router;
