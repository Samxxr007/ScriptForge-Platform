import { prisma } from '../db.js';

export class VersionService {
  static async listVersions(documentId: string) {
    return prisma.version.findMany({
      where: { documentId },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { versionNumber: 'desc' },
    });
  }

  static async getVersion(versionId: string) {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (!version) {
      const err: any = new Error('Version not found');
      err.statusCode = 404;
      throw err;
    }

    return version;
  }

  static async createVersion(documentId: string, userId: string, changeSummary?: string) {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new Error('Document not found');

    const nextVersion = doc.currentVersion + 1;

    const version = await prisma.version.create({
      data: {
        documentId,
        versionNumber: nextVersion,
        content: doc.content,
        createdBy: userId,
        changeSummary: changeSummary || `Checkpoint Version ${nextVersion}`,
        isCheckpoint: true,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { currentVersion: nextVersion },
    });

    await prisma.activity.create({
      data: {
        projectId: doc.projectId,
        userId,
        type: 'VERSION_CREATED',
        metadata: JSON.stringify({ versionNumber: nextVersion, summary: version.changeSummary }),
      },
    });

    return version;
  }

  /**
   * Safe non-destructive restore: Creates a brand new version whose content is
   * the restored version, updates document content, and logs the action.
   */
  static async restoreVersion(versionId: string, userId: string) {
    const targetVersion = await prisma.version.findUnique({
      where: { id: versionId },
      include: { document: true },
    });

    if (!targetVersion) {
      const err: any = new Error('Version not found to restore');
      err.statusCode = 404;
      throw err;
    }

    const documentId = targetVersion.documentId;
    const currentDoc = targetVersion.document;
    const newVersionNumber = currentDoc.currentVersion + 1;

    // 1. Create new restoration version
    const newVersion = await prisma.version.create({
      data: {
        documentId,
        versionNumber: newVersionNumber,
        content: targetVersion.content,
        createdBy: userId,
        changeSummary: `Restored from Version ${targetVersion.versionNumber}`,
        isCheckpoint: true,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    // 2. Update active document content
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: targetVersion.content,
        currentVersion: newVersionNumber,
      },
    });

    // 3. Log activity
    await prisma.activity.create({
      data: {
        projectId: currentDoc.projectId,
        userId,
        type: 'VERSION_RESTORED',
        metadata: JSON.stringify({
          restoredFrom: targetVersion.versionNumber,
          newVersion: newVersionNumber,
        }),
      },
    });

    return {
      restoredVersion: newVersion,
      content: targetVersion.content,
      currentVersion: newVersionNumber,
    };
  }

  static async compareVersions(v1Id: string, v2Id: string) {
    const [v1, v2] = await Promise.all([
      prisma.version.findUnique({ where: { id: v1Id } }),
      prisma.version.findUnique({ where: { id: v2Id } }),
    ]);

    if (!v1 || !v2) {
      const err: any = new Error('One or both versions not found for comparison');
      err.statusCode = 404;
      throw err;
    }

    return {
      v1: { id: v1.id, versionNumber: v1.versionNumber, content: v1.content, createdAt: v1.createdAt },
      v2: { id: v2.id, versionNumber: v2.versionNumber, content: v2.content, createdAt: v2.createdAt },
    };
  }
}
