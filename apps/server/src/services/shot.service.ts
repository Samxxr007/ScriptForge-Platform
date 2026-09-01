import { prisma } from '../db.js';

export class ShotService {
  static async listShotsForScene(sceneId: string) {
    return prisma.shot.findMany({
      where: { sceneId },
      include: {
        storyboard: true,
      },
      orderBy: { shotNumber: 'asc' },
    });
  }

  static async createShot(sceneId: string, data: any) {
    const count = await prisma.shot.count({ where: { sceneId } });
    const shotNumber = data.shotNumber || count + 1;

    const shot = await prisma.shot.create({
      data: {
        sceneId,
        shotNumber,
        shotType: data.shotType || 'Medium Shot',
        lens: data.lens || '50mm',
        cameraPosition: data.cameraPosition || '{"x":0,"y":1.5,"z":3}',
        cameraRotation: data.cameraRotation || '{"x":0,"y":0,"z":0}',
        cameraHeight: data.cameraHeight || 'Eye-Level',
        movement: data.movement || 'Static',
        duration: data.duration || 4,
        description: data.description || '',
        purpose: data.purpose || '',
        characters: data.characters || '',
        dialogueLine: data.dialogueLine || '',
        aiGenerated: !!data.aiGenerated,
      },
      include: {
        storyboard: true,
      },
    });

    // Automatically create a pending storyboard frame entry
    await prisma.storyboardFrame.create({
      data: {
        shotId: shot.id,
        prompt: `Cinematic ${shot.shotType}, ${shot.lens} lens. ${shot.description || ''}`,
        structuredPrompt: JSON.stringify({
          shot: shot.shotType,
          lens: shot.lens,
          movement: shot.movement,
          characters: shot.characters,
        }),
        status: 'PENDING',
      },
    });

    return prisma.shot.findUnique({
      where: { id: shot.id },
      include: { storyboard: true },
    });
  }

  static async updateShot(shotId: string, data: any) {
    return prisma.shot.update({
      where: { id: shotId },
      data,
      include: { storyboard: true },
    });
  }

  static async deleteShot(shotId: string) {
    return prisma.shot.delete({
      where: { id: shotId },
    });
  }

  static async updateStoryboardFrame(shotId: string, data: { imageUrl?: string; prompt?: string; structuredPrompt?: string; status?: string }) {
    return prisma.storyboardFrame.upsert({
      where: { shotId },
      create: {
        shotId,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        structuredPrompt: data.structuredPrompt,
        status: data.status || 'GENERATED',
      },
      update: {
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        structuredPrompt: data.structuredPrompt,
        status: data.status,
      },
    });
  }

  // Camera Setup (3D / Previs)
  static async getCameraSetups(sceneId: string) {
    return prisma.cameraSetup.findMany({
      where: { sceneId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async createCameraSetup(sceneId: string, data: any) {
    return prisma.cameraSetup.create({
      data: {
        sceneId,
        name: data.name || 'Camera 01',
        position: typeof data.position === 'object' ? JSON.stringify(data.position) : data.position || '{"x":0,"y":1.8,"z":4.0}',
        rotation: typeof data.rotation === 'object' ? JSON.stringify(data.rotation) : data.rotation || '{"x":0,"y":0,"z":0}',
        lens: data.lens || '35mm',
        fieldOfView: data.fieldOfView || 50,
        height: data.height || 1.8,
      },
    });
  }

  static async updateCameraSetup(id: string, data: any) {
    return prisma.cameraSetup.update({
      where: { id },
      data: {
        name: data.name,
        position: typeof data.position === 'object' ? JSON.stringify(data.position) : data.position,
        rotation: typeof data.rotation === 'object' ? JSON.stringify(data.rotation) : data.rotation,
        lens: data.lens,
        fieldOfView: data.fieldOfView,
        height: data.height,
      },
    });
  }

  static async deleteCameraSetup(id: string) {
    return prisma.cameraSetup.delete({ where: { id } });
  }

  // Scene Layout (Top-down 3D Previs)
  static async getSceneLayout(sceneId: string) {
    let layout = await prisma.sceneLayout.findUnique({ where: { sceneId } });
    if (!layout) {
      layout = await prisma.sceneLayout.create({
        data: {
          sceneId,
          environment: '{"type":"interior_room","width":12,"length":16,"height":3.5}',
          objects: '[]',
          characterPositions: '[]',
          lighting: '{"keyLight":{"x":-2,"y":2.5,"z":1.5,"color":"#ffffff","intensity":1}}',
        },
      });
    }
    return layout;
  }

  static async updateSceneLayout(sceneId: string, data: { environment?: any; objects?: any; characterPositions?: any; lighting?: any }) {
    return prisma.sceneLayout.upsert({
      where: { sceneId },
      create: {
        sceneId,
        environment: typeof data.environment === 'object' ? JSON.stringify(data.environment) : data.environment || '{}',
        objects: typeof data.objects === 'object' ? JSON.stringify(data.objects) : data.objects || '[]',
        characterPositions: typeof data.characterPositions === 'object' ? JSON.stringify(data.characterPositions) : data.characterPositions || '[]',
        lighting: typeof data.lighting === 'object' ? JSON.stringify(data.lighting) : data.lighting || '{}',
      },
      update: {
        environment: typeof data.environment === 'object' ? JSON.stringify(data.environment) : data.environment,
        objects: typeof data.objects === 'object' ? JSON.stringify(data.objects) : data.objects,
        characterPositions: typeof data.characterPositions === 'object' ? JSON.stringify(data.characterPositions) : data.characterPositions,
        lighting: typeof data.lighting === 'object' ? JSON.stringify(data.lighting) : data.lighting,
      },
    });
  }
}
