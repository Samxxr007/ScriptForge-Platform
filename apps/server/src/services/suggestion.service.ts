import { prisma } from '../db.js';

export class SuggestionService {
  static async listSuggestions(documentId: string) {
    return prisma.suggestion.findMany({
      where: { documentId },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createSuggestion(data: {
    documentId: string;
    sceneId?: string;
    authorId: string;
    originalText: string;
    suggestedText: string;
    reason?: string;
  }) {
    const suggestion = await prisma.suggestion.create({
      data: {
        documentId: data.documentId,
        sceneId: data.sceneId,
        authorId: data.authorId,
        originalText: data.originalText,
        suggestedText: data.suggestedText,
        reason: data.reason,
        status: 'PENDING',
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const doc = await prisma.document.findUnique({
      where: { id: data.documentId },
    });

    if (doc) {
      await prisma.activity.create({
        data: {
          projectId: doc.projectId,
          userId: data.authorId,
          type: 'SUGGESTION_CREATED',
          metadata: JSON.stringify({ suggestionId: suggestion.id, reason: data.reason }),
        },
      });
    }

    return suggestion;
  }

  static async acceptSuggestion(suggestionId: string, actorId: string) {
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
      include: { document: true },
    });

    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    const doc = suggestion.document;
    let newContent = doc.content;

    // Apply replacement to document content
    if (doc.content.includes(suggestion.originalText)) {
      newContent = doc.content.replace(suggestion.originalText, suggestion.suggestedText);
      await prisma.document.update({
        where: { id: doc.id },
        data: { content: newContent },
      });
    }

    const updated = await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: 'ACCEPTED' },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await prisma.activity.create({
      data: {
        projectId: doc.projectId,
        userId: actorId,
        type: 'SUGGESTION_ACCEPTED',
        metadata: JSON.stringify({ suggestionId }),
      },
    });

    return { suggestion: updated, content: newContent };
  }

  static async rejectSuggestion(suggestionId: string, actorId: string) {
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
      include: { document: true },
    });

    if (!suggestion) throw new Error('Suggestion not found');

    const updated = await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: 'REJECTED' },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await prisma.activity.create({
      data: {
        projectId: suggestion.document.projectId,
        userId: actorId,
        type: 'SUGGESTION_REJECTED',
        metadata: JSON.stringify({ suggestionId }),
      },
    });

    return updated;
  }
}
