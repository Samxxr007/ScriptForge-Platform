import { prisma } from '../db.js';

export interface CreateProjectDTO {
  name: string;
  description?: string;
  type?: string;
  template?: string;
  logline?: string;
  genre?: string;
  visualStyle?: string;
  targetAudience?: string;
}

export class ProjectService {
  static async listUserProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
            currentVersion: true,
            updatedAt: true,
            _count: { select: { scenes: true } },
          },
        },
        _count: {
          select: {
            characters: true,
            activities: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return projects;
  }

  static async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, roleTitle: true } },
          },
        },
        documents: {
          include: {
            scenes: {
              orderBy: { order: 'asc' },
              include: {
                shots: {
                  orderBy: { shotNumber: 'asc' },
                  include: { storyboard: true },
                },
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
        },
        characters: {
          orderBy: { createdAt: 'asc' },
        },
        locations: true,
        activities: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    return project;
  }

  static async createProject(userId: string, dto: CreateProjectDTO) {
    const type = dto.type || 'SCREENPLAY';
    const visualStyle = dto.visualStyle || 'Cinematic Realism';

    const project = await prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        logline: dto.logline || '',
        genre: dto.genre || 'Drama',
        type,
        visualStyle,
        targetAudience: dto.targetAudience || 'General Audience',
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });

    // Create Initial Document based on template
    const templateContent = this.getTemplateContent(dto.template || 'Blank', dto.name);

    const doc = await prisma.document.create({
      data: {
        projectId: project.id,
        title: `${dto.name} - Master Draft`,
        content: templateContent.screenplay,
        currentVersion: 1,
      },
    });

    // Create initial scenes if provided by template
    if (templateContent.scenes && templateContent.scenes.length > 0) {
      for (let i = 0; i < templateContent.scenes.length; i++) {
        const sc = templateContent.scenes[i];
        const scene = await prisma.scene.create({
          data: {
            documentId: doc.id,
            order: i + 1,
            sceneNumber: i + 1,
            title: sc.title,
            intExt: sc.intExt || 'INT',
            location: sc.location || 'LOCATION',
            timeOfDay: sc.timeOfDay || 'DAY',
            content: sc.content || '',
            purpose: sc.purpose || '',
            emotionalTone: sc.emotionalTone || '',
          },
        });

        // Add a default camera setup & scene layout
        await prisma.cameraSetup.create({
          data: {
            sceneId: scene.id,
            name: 'Camera 01 - Master',
            position: '{"x":0,"y":1.8,"z":4.0}',
            rotation: '{"x":-5,"y":0,"z":0}',
            lens: '35mm',
            fieldOfView: 55,
            height: 1.8,
          },
        });

        await prisma.sceneLayout.create({
          data: {
            sceneId: scene.id,
            environment: '{"type":"generic_room","width":10,"length":12,"height":3}',
            objects: '[]',
            characterPositions: '[]',
            lighting: '{"keyLight":{"x":-2,"y":2.5,"z":1.5,"color":"#ffffff","intensity":1}}',
          },
        });
      }
    }

    // Create Version 1 snapshot
    await prisma.version.create({
      data: {
        documentId: doc.id,
        versionNumber: 1,
        content: templateContent.screenplay,
        createdBy: userId,
        changeSummary: 'Initial project creation from template: ' + (dto.template || 'Blank'),
        isCheckpoint: true,
      },
    });

    // Create Activity Log
    await prisma.activity.create({
      data: {
        projectId: project.id,
        userId,
        type: 'PROJECT_CREATED',
        metadata: JSON.stringify({ projectName: project.name, type: project.type }),
      },
    });

    return this.getProjectById(project.id, userId);
  }

  static async updateProject(projectId: string, data: Partial<CreateProjectDTO>) {
    return prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        logline: data.logline,
        genre: data.genre,
        type: data.type,
        visualStyle: data.visualStyle,
        targetAudience: data.targetAudience,
      },
    });
  }

  static async deleteProject(projectId: string) {
    return prisma.project.delete({
      where: { id: projectId },
    });
  }

  static async addMember(projectId: string, email: string, role: string, actorId: string) {
    const userToInvite = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userToInvite) {
      const error: any = new Error('User with this email not found. Please ask them to register first.');
      error.statusCode = 404;
      throw error;
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: userToInvite.id,
        },
      },
    });

    if (existingMember) {
      const error: any = new Error('User is already a collaborator on this project.');
      error.statusCode = 400;
      throw error;
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToInvite.id,
        role: role.toUpperCase() || 'WRITER',
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: userToInvite.id,
        title: 'Project Invitation',
        message: `You were invited to collaborate as ${member.role} on a project.`,
        link: `/projects/${projectId}`,
        type: 'INVITATION',
      },
    });

    // Create Activity
    await prisma.activity.create({
      data: {
        projectId,
        userId: actorId,
        type: 'MEMBER_JOINED',
        metadata: JSON.stringify({ invitedUser: userToInvite.name, role: member.role }),
      },
    });

    return member;
  }

  static async updateMemberRole(projectId: string, memberId: string, role: string) {
    return prisma.projectMember.update({
      where: { id: memberId },
      data: { role: role.toUpperCase() },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  static async removeMember(projectId: string, memberId: string) {
    return prisma.projectMember.delete({
      where: { id: memberId },
    });
  }

  private static getTemplateContent(template: string, title: string) {
    switch (template) {
      case 'Three-Act Structure':
        return {
          screenplay: `INT. MAIN LOCATION - DAY\n\nACT I: SETUP\n\nThe protagonist is introduced in their everyday world.\n\nINT. TURNING POINT LOCATION - NIGHT\n\nACT II: CONFRONTATION\n\nThe stakes escalate dramatically as obstacles multiply.\n\nINT. CLIMAX LOCATION - NIGHT\n\nACT III: RESOLUTION\n\nThe ultimate confrontation and new equilibrium.`,
          scenes: [
            { title: 'INT. MAIN LOCATION - DAY', intExt: 'INT', location: 'MAIN LOCATION', timeOfDay: 'DAY', purpose: 'Establish everyday reality and character flaw.' },
            { title: 'INT. TURNING POINT LOCATION - NIGHT', intExt: 'INT', location: 'TURNING POINT LOCATION', timeOfDay: 'NIGHT', purpose: 'Crossing the threshold into high stakes.' },
            { title: 'INT. CLIMAX LOCATION - NIGHT', intExt: 'INT', location: 'CLIMAX LOCATION', timeOfDay: 'NIGHT', purpose: 'Final confrontation and thematic catharsis.' },
          ],
        };
      case 'Save the Cat':
        return {
          screenplay: `INT. OPENING IMAGE - DAY\n\nOpening visual sets tone, theme, and protagonist's dilemma.\n\nINT. CATALYST ROOM - NIGHT\n\nThe inciting incident that breaks the protagonist's status quo.\n\nINT. BREAK INTO TWO - DAWN\n\nThe protagonist makes the conscious choice to enter the new world.`,
          scenes: [
            { title: 'INT. OPENING IMAGE - DAY', intExt: 'INT', location: 'OPENING IMAGE', timeOfDay: 'DAY', purpose: 'Opening image and statement of theme.' },
            { title: 'INT. CATALYST ROOM - NIGHT', intExt: 'INT', location: 'CATALYST ROOM', timeOfDay: 'NIGHT', purpose: 'Inciting incident shattering status quo.' },
            { title: 'INT. BREAK INTO TWO - DAWN', intExt: 'INT', location: 'BREAK INTO TWO', timeOfDay: 'DAWN', purpose: 'Commitment to the quest.' },
          ],
        };
      case 'Screenplay Standard':
      default:
        return {
          screenplay: `INT. COFFEE SHOP - DAY\n\nSunlight spills across a worn Formica table. Steam rises from a ceramic mug.\n\nSARAH (30s) furiously types on an old mechanical laptop. She pauses, looking toward the entrance.\n\nSARAH\n(under her breath)\nDon't be late. Not today.\n\nThe bell above the door CHIMES.\n\nJOHN (30s) enters, shaking rain from his coat. He catches Sarah's eye and approaches with grim resolve.\n\nJOHN\nThey know about the signal.`,
          scenes: [
            {
              title: 'INT. COFFEE SHOP - DAY',
              intExt: 'INT',
              location: 'COFFEE SHOP',
              timeOfDay: 'DAY',
              content: `Sunlight spills across a worn Formica table. Steam rises from a ceramic mug.\n\nSARAH (30s) furiously types on an old mechanical laptop. She pauses, looking toward the entrance.\n\nSARAH\n(under her breath)\nDon't be late. Not today.\n\nThe bell above the door CHIMES.\n\nJOHN (30s) enters, shaking rain from his coat. He catches Sarah's eye and approaches with grim resolve.\n\nJOHN\nThey know about the signal.`,
              purpose: 'Introduce urgent stakes and core dynamic between Sarah and John.',
              emotionalTone: 'Tense, hurried',
            },
          ],
        };
    }
  }
}
