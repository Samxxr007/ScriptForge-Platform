import { prisma } from '../db.js';

export class CharacterService {
  static async listCharacters(projectId: string) {
    const characters = await prisma.character.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    // Get documents to calculate appearance counts in scenes
    const doc = await prisma.document.findFirst({
      where: { projectId },
      include: { scenes: true },
    });

    const charactersWithStats = characters.map((char) => {
      let appearanceCount = 0;
      const appearingSceneIds: string[] = [];

      if (doc) {
        const regex = new RegExp(`\\b${char.name.toUpperCase()}\\b`, 'i');
        doc.scenes.forEach((scene) => {
          if (regex.test(scene.content) || (scene.title && regex.test(scene.title))) {
            appearanceCount++;
            appearingSceneIds.push(scene.id);
          }
        });
      }

      return {
        ...char,
        appearanceCount,
        appearingSceneIds,
      };
    });

    return charactersWithStats;
  }

  static async getCharacter(characterId: string) {
    return prisma.character.findUnique({
      where: { id: characterId },
    });
  }

  static async createCharacter(projectId: string, data: any) {
    return prisma.character.create({
      data: {
        projectId,
        name: data.name.toUpperCase(),
        role: data.role || 'Supporting',
        description: data.description || '',
        age: data.age || '',
        personality: data.personality || '',
        motivation: data.motivation || '',
        goal: data.goal || '',
        fear: data.fear || '',
        arc: data.arc || '',
        relationships: data.relationships || '',
        faceDescription: data.faceDescription || '',
        hair: data.hair || '',
        clothing: data.clothing || '',
        bodyType: data.bodyType || '',
        colorPalette: data.colorPalette || '#06b6d4',
        referenceImage: data.referenceImage || '',
      },
    });
  }

  static async updateCharacter(characterId: string, data: any) {
    return prisma.character.update({
      where: { id: characterId },
      data: {
        ...data,
        name: data.name ? data.name.toUpperCase() : undefined,
      },
    });
  }

  static async deleteCharacter(characterId: string) {
    return prisma.character.delete({
      where: { id: characterId },
    });
  }
}
