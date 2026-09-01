import { Router } from 'express';
import { ExportService } from '../services/export.service.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Screenplay PDF
router.get('/pdf/:documentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const pdfBuffer = await ExportService.exportScreenplayPDF(req.params.documentId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="screenplay.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

// Final Draft FDX XML
router.get('/fdx/:documentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const fdxXml = await ExportService.exportFDX(req.params.documentId);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="screenplay.fdx"`);
    res.send(fdxXml);
  } catch (err) {
    next(err);
  }
});

// Fountain text
router.get('/fountain/:documentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const fountainText = await ExportService.exportFountain(req.params.documentId);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="screenplay.fountain"`);
    res.send(fountainText);
  } catch (err) {
    next(err);
  }
});

// Microsoft Word DOCX
router.get('/docx/:documentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const docxBuffer = await ExportService.exportDOCX(req.params.documentId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="screenplay.docx"`);
    res.send(docxBuffer);
  } catch (err) {
    next(err);
  }
});

// Shot List PDF
router.get('/shot-list-pdf/:sceneId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const pdfBuffer = await ExportService.exportShotListPDF(req.params.sceneId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="shot-list.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
