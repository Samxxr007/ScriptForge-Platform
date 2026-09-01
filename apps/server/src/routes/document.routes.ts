import { Router } from 'express';
import { DocumentService } from '../services/document.service.ts';
import { VersionService } from '../services/version.service.ts';
import { BranchService } from '../services/branch.service.ts';
import { CommentService } from '../services/comment.service.ts';
import { SuggestionService } from '../services/suggestion.service.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// 1. Documents
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const document = await DocumentService.getDocument(req.params.id);
    res.json({ document });
  } catch (err) {
    next(err);
  }
});

// Update / Autosave document content
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { content, createCheckpoint } = req.body;
    const document = await DocumentService.updateContent(req.params.id, content, req.user!.id, !!createCheckpoint);
    res.json({ document });
  } catch (err) {
    next(err);
  }
});

// 2. Scenes
router.post('/:id/scenes', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const scene = await DocumentService.createScene(req.params.id, req.body);
    res.status(201).json({ scene });
  } catch (err) {
    next(err);
  }
});

router.patch('/scenes/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const scene = await DocumentService.updateScene(req.params.sceneId, req.body);
    res.json({ scene });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/scenes/reorder', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sceneIds } = req.body;
    const scenes = await DocumentService.reorderScenes(req.params.id, sceneIds);
    res.json({ scenes });
  } catch (err) {
    next(err);
  }
});

router.delete('/scenes/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await DocumentService.deleteScene(req.params.sceneId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// 3. Versions (Version History & Safe Restore)
router.get('/:id/versions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const versions = await VersionService.listVersions(req.params.id);
    res.json({ versions });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/versions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { changeSummary } = req.body;
    const version = await VersionService.createVersion(req.params.id, req.user!.id, changeSummary);
    res.status(201).json({ version });
  } catch (err) {
    next(err);
  }
});

router.get('/versions/:versionId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const version = await VersionService.getVersion(req.params.versionId);
    res.json({ version });
  } catch (err) {
    next(err);
  }
});

router.post('/versions/:versionId/restore', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await VersionService.restoreVersion(req.params.versionId, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/versions/compare/:v1Id/:v2Id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const diff = await VersionService.compareVersions(req.params.v1Id, req.params.v2Id);
    res.json({ diff });
  } catch (err) {
    next(err);
  }
});

// 4. Branches (Story Branches & Trees)
router.get('/:id/branches', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const branches = await BranchService.listBranches(req.params.id);
    res.json({ branches });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/branches', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = req.body;
    const branch = await BranchService.createBranch(req.params.id, name, description, req.user!.id);
    res.status(201).json({ branch });
  } catch (err) {
    next(err);
  }
});

router.patch('/branches/:branchId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const branch = await BranchService.updateBranch(req.params.branchId, req.body);
    res.json({ branch });
  } catch (err) {
    next(err);
  }
});

router.post('/branches/:branchId/save', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { content } = req.body;
    const branchVer = await BranchService.saveBranchContent(req.params.branchId, content, req.user!.id);
    res.json({ branchVersion: branchVer });
  } catch (err) {
    next(err);
  }
});

router.post('/branches/:branchId/merge', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { documentId } = req.body;
    const doc = await BranchService.mergeBranch(req.params.branchId, documentId, req.user!.id);
    res.json({ document: doc });
  } catch (err) {
    next(err);
  }
});

router.delete('/branches/:branchId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await BranchService.deleteBranch(req.params.branchId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// 5. Comments
router.get('/:id/comments', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const comments = await CommentService.listComments(req.params.id);
    res.json({ comments });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const comment = await CommentService.createComment({
      documentId: req.params.id,
      authorId: req.user!.id,
      ...req.body,
    });
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
});

router.patch('/comments/:commentId/resolve', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const comment = await CommentService.resolveComment(req.params.commentId);
    res.json({ comment });
  } catch (err) {
    next(err);
  }
});

router.patch('/comments/:commentId/reopen', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const comment = await CommentService.reopenComment(req.params.commentId);
    res.json({ comment });
  } catch (err) {
    next(err);
  }
});

router.delete('/comments/:commentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await CommentService.deleteComment(req.params.commentId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// 6. Suggestions
router.get('/:id/suggestions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const suggestions = await SuggestionService.listSuggestions(req.params.id);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/suggestions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const suggestion = await SuggestionService.createSuggestion({
      documentId: req.params.id,
      authorId: req.user!.id,
      ...req.body,
    });
    res.status(201).json({ suggestion });
  } catch (err) {
    next(err);
  }
});

router.post('/suggestions/:suggestionId/accept', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await SuggestionService.acceptSuggestion(req.params.suggestionId, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/suggestions/:suggestionId/reject', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await SuggestionService.rejectSuggestion(req.params.suggestionId, req.user!.id);
    res.json({ suggestion: result });
  } catch (err) {
    next(err);
  }
});

export default router;
