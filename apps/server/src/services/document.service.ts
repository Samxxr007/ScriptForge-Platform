import { prisma } from '../db.js';

export class DocumentService {
  static async getDocument(documentId: string) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        project: {
          include: {
            members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
          },
        },
        scenes: {
          orderBy: { order: 'asc' },
          include: {
            shots: { orderBy: { shotNumber: 'asc' }, include: { storyboard: true } },
            cameraSetups: true,
            sceneLayout: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: { author: { select: { id: true, name: true, avatar: true } } },
        },
        branches: {
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              include: { author: { select: { id: true, name: true, avatar: true } } },
            },
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        suggestions: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!doc) {
      const err: any = new Error('Document not found');
      err.statusCode = 404;
      throw err;
    }

    return doc;
  }

  static async updateContent(documentId: string, content: string, userId: string, createCheckpoint = false) {
    const existingDoc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDoc) {
      const err: any = new Error('Document not found');
      err.statusCode = 404;
      throw err;
    }

    const updatedDoc = await prisma.document.update({
      where: { id: documentId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    // Extract scenes from screenplay formatting automatically (lines starting with INT. / EXT.)
    await this.syncScenesFromContent(documentId, content);

    // If checkpoint requested, increment version and create snapshot
    if (createCheckpoint) {
      const nextVersion = existingDoc.currentVersion + 1;
      await prisma.version.create({
        data: {
          documentId,
          versionNumber: nextVersion,
          content,
          createdBy: userId,
          changeSummary: `Manual checkpoint save v${nextVersion}`,
          isCheckpoint: true,
        },
      });

      await prisma.document.update({
        where: { id: documentId },
        data: { currentVersion: nextVersion },
      });

      await prisma.activity.create({
        data: {
          projectId: existingDoc.projectId,
          userId,
          type: 'VERSION_CREATED',
          metadata: JSON.stringify({ versionNumber: nextVersion }),
        },
      });
    }

    return updatedDoc;
  }

  static async createScene(documentId: string, data: { title: string; location?: string; intExt?: string; timeOfDay?: string; order?: number }) {
    const count = await prisma.scene.count({ where: { documentId } });
    const order = data.order !== undefined ? data.order : count + 1;

    const scene = await prisma.scene.create({
      data: {
        documentId,
        title: data.title,
        location: data.location || 'LOCATION',
        intExt: data.intExt || 'INT',
        timeOfDay: data.timeOfDay || 'DAY',
        order,
        sceneNumber: order,
      },
    });

    // Create default Camera setup and scene layout for 3D previs
    await prisma.cameraSetup.create({
      data: {
        sceneId: scene.id,
        name: 'Camera 01 - Master Wide',
        position: '{"x":0,"y":2,"z":4.5}',
        rotation: '{"x":-5,"y":0,"z":0}',
        lens: '35mm',
        fieldOfView: 55,
        height: 2.0,
      },
    });

    await prisma.sceneLayout.create({
      data: {
        sceneId: scene.id,
        environment: '{"type":"interior_room","width":12,"length":14,"height":3.5}',
        objects: '[]',
        characterPositions: '[]',
        lighting: '{"keyLight":{"x":-2,"y":2.5,"z":1.5,"color":"#ffffff","intensity":1}}',
      },
    });

    return scene;
  }

  static async updateScene(sceneId: string, data: any) {
    return prisma.scene.update({
      where: { id: sceneId },
      data,
    });
  }

  static async reorderScenes(documentId: string, sceneIds: string[]) {
    // Transaction to update orders
    await prisma.$transaction(
      sceneIds.map((id, index) =>
        prisma.scene.update({
          where: { id },
          data: { order: index + 1, sceneNumber: index + 1 },
        })
      )
    );

    return prisma.scene.findMany({
      where: { documentId },
      orderBy: { order: 'asc' },
    });
  }

  static async deleteScene(sceneId: string) {
    return prisma.scene.delete({
      where: { id: sceneId },
    });
  }

  private static async syncScenesFromContent(documentId: string, content: string) {
    const lines = content.split('\n');
    const sceneHeaders: { title: string; lineIndex: number }[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(trimmed)) {
        sceneHeaders.push({ title: trimmed.toUpperCase(), lineIndex: idx });
      }
    });

    if (sceneHeaders.length === 0) return;

    // Check existing scenes
    const existingScenes = await prisma.scene.findMany({
      where: { documentId },
      orderBy: { order: 'asc' },
    });

    // Update existing scene titles/orders or create new ones
    for (let i = 0; i < sceneHeaders.length; i++) {
      const header = sceneHeaders[i];
      const match = header.title.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.*?)(?:\s*-\s*(DAY|NIGHT|DUSK|DAWN|CONTINUOUS|LATER))?$/i);
      
      const intExt = match ? match[1].replace('.', '').toUpperCase() : 'INT';
      const location = match && match[2] ? match[2].trim() : 'SCENE';
      const timeOfDay = match && match[3] ? match[3].trim().toUpperCase() : 'DAY';

      if (i < existingScenes.length) {
        await prisma.scene.update({
          where: { id: existingScenes[i].id },
          data: {
            title: header.title,
            intExt,
            location,
            timeOfDay,
            order: i + 1,
            sceneNumber: i + 1,
          },
        });
      } else {
        const newScene = await prisma.scene.create({
          data: {
            documentId,
            title: header.title,
            intExt,
            location,
            timeOfDay,
            order: i + 1,
            sceneNumber: i + 1,
          },
        });

        await prisma.cameraSetup.create({
          data: {
            sceneId: newScene.id,
            name: 'Camera 01 - Master Wide',
            position: '{"x":0,"y":2,"z":4.5}',
            rotation: '{"x":-5,"y":0,"z":0}',
            lens: '35mm',
            fieldOfView: 55,
            height: 2.0,
          },
        });

        await prisma.sceneLayout.create({
          data: {
            sceneId: newScene.id,
            environment: '{"type":"interior_room","width":12,"length":14,"height":3.5}',
            objects: '[]',
            characterPositions: '[]',
            lighting: '{"keyLight":{"x":-2,"y":2.5,"z":1.5,"color":"#ffffff","intensity":1}}',
          },
        });
      }
    }
  }
}
