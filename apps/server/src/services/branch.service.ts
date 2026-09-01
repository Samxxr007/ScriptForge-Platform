import { prisma } from '../db.js';

export class BranchService {
  static async listBranches(documentId: string) {
    return prisma.branch.findMany({
      where: { documentId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async createBranch(documentId: string, name: string, description: string | undefined, userId: string) {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new Error('Document not found');

    const branch = await prisma.branch.create({
      data: {
        documentId,
        name,
        description,
        createdBy: userId,
        versions: {
          create: {
            content: doc.content,
            versionNumber: 1,
            createdBy: userId,
          },
        },
      },
      include: {
        versions: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    await prisma.activity.create({
      data: {
        projectId: doc.projectId,
        userId,
        type: 'BRANCH_CREATED',
        metadata: JSON.stringify({ branchName: name, branchId: branch.id }),
      },
    });

    return branch;
  }

  static async updateBranch(branchId: string, data: { name?: string; description?: string }) {
    return prisma.branch.update({
      where: { id: branchId },
      data,
    });
  }

  static async saveBranchContent(branchId: string, content: string, userId: string) {
    const latest = await prisma.branchVersion.findFirst({
      where: { branchId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVer = (latest?.versionNumber || 0) + 1;

    return prisma.branchVersion.create({
      data: {
        branchId,
        content,
        versionNumber: nextVer,
        createdBy: userId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  static async mergeBranch(branchId: string, documentId: string, userId: string) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
        document: true,
      },
    });

    if (!branch || branch.versions.length === 0) {
      throw new Error('Branch or branch version not found to merge');
    }

    const latestContent = branch.versions[0].content;
    const doc = branch.document;
    const newVersionNumber = doc.currentVersion + 1;

    // Create a new version in main representing the merge
    await prisma.version.create({
      data: {
        documentId,
        versionNumber: newVersionNumber,
        content: latestContent,
        createdBy: userId,
        changeSummary: `Merged branch "${branch.name}" into main`,
        isCheckpoint: true,
      },
    });

    // Update document content
    const updatedDoc = await prisma.document.update({
      where: { id: documentId },
      data: {
        content: latestContent,
        currentVersion: newVersionNumber,
      },
    });

    await prisma.activity.create({
      data: {
        projectId: doc.projectId,
        userId,
        type: 'BRANCH_MERGED',
        metadata: JSON.stringify({ branchName: branch.name, branchId }),
      },
    });

    return updatedDoc;
  }

  static async deleteBranch(branchId: string) {
    return prisma.branch.delete({
      where: { id: branchId },
    });
  }
}
