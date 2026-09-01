import { prisma } from '../db.js';

export class CommentService {
  static async listComments(documentId: string) {
    return prisma.comment.findMany({
      where: { documentId, parentId: null },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createComment(data: {
    documentId: string;
    sceneId?: string;
    authorId: string;
    content: string;
    selectedText?: string;
    startPosition?: number;
    endPosition?: number;
    parentId?: string;
  }) {
    const comment = await prisma.comment.create({
      data: {
        documentId: data.documentId,
        sceneId: data.sceneId,
        authorId: data.authorId,
        content: data.content,
        selectedText: data.selectedText,
        startPosition: data.startPosition,
        endPosition: data.endPosition,
        parentId: data.parentId,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const doc = await prisma.document.findUnique({
      where: { id: data.documentId },
      include: { project: true },
    });

    if (doc) {
      await prisma.activity.create({
        data: {
          projectId: doc.projectId,
          userId: data.authorId,
          type: 'COMMENT_ADDED',
          metadata: JSON.stringify({ commentId: comment.id, preview: data.content.slice(0, 50) }),
        },
      });
    }

    return comment;
  }

  static async resolveComment(commentId: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  static async reopenComment(commentId: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: {
        status: 'OPEN',
        resolvedAt: null,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  static async deleteComment(commentId: string) {
    return prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
