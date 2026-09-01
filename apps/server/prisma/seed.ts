import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ScriptForge database seed...');

  // 1. Create Demo Users
  const passwordHash = await bcrypt.hash('Demo1234!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@scriptforge.local' },
    update: {},
    create: {
      name: 'Sameer G',
      email: 'demo@scriptforge.local',
      passwordHash,
      roleTitle: 'Director & Screenwriter',
      preferredType: 'Screenplay',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const sarahUser = await prisma.user.upsert({
    where: { email: 'sarah.editor@scriptforge.local' },
    update: {},
    create: {
      name: 'Sarah Chen',
      email: 'sarah.editor@scriptforge.local',
      passwordHash,
      roleTitle: 'Lead Story Editor',
      preferredType: 'Screenplay',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  });

  const alexUser = await prisma.user.upsert({
    where: { email: 'alex.writer@scriptforge.local' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'alex.writer@scriptforge.local',
      passwordHash,
      roleTitle: 'Staff Writer',
      preferredType: 'Screenplay',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✓ Created users:', demoUser.email, sarahUser.email, alexUser.email);

  // 2. Create Master Project: "The Last Signal"
  const project = await prisma.project.create({
    data: {
      name: 'The Last Signal',
      description: 'A deep-space psychological thriller where a lonely signal analyst discovers an audio anomaly that predicts crew deaths minutes before they happen.',
      logline: 'When an isolated deep-space communications officer intercepts a transmission predicting her crewmates’ immediate demises, she must decipher the source before the final broadcast targets her.',
      genre: 'Sci-Fi Thriller',
      type: 'SCREENPLAY',
      visualStyle: 'Neo-Noir Sci-Fi',
      targetAudience: 'Adults 18-45, Fans of Arrival & Ex Machina',
      themes: 'Determinism vs. Free Will, Isolation, Artificial Consciousness',
      ownerId: demoUser.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'OWNER' },
          { userId: sarahUser.id, role: 'EDITOR' },
          { userId: alexUser.id, role: 'WRITER' },
        ],
      },
    },
  });

  console.log('✓ Created project:', project.name);

  // 3. Create Characters
  const maya = await prisma.character.create({
    data: {
      projectId: project.id,
      name: 'MAYA VANCE',
      role: 'Protagonist',
      age: '32',
      personality: 'Hyper-observant, obsessive, emotionally guarded',
      motivation: 'To find the source of the anomaly and protect her remaining crew',
      goal: 'Decipher the dying beacon before orbital decay',
      fear: 'Inheriting her mother’s psychiatric deterioration in deep isolation',
      arc: 'From detached scientific observer to decisive survivor willing to trust intuition',
      faceDescription: 'Sharp jawline, tired amber eyes with dark circles from sleepless shifts',
      hair: 'Dark raven hair tightly pulled into a utilitarian technician bun',
      clothing: 'Weathered slate-grey thermal flight jumpsuit with patched comms shoulder badge',
      bodyType: 'Lean, athletic build',
      colorPalette: 'Cool cyan, graphite grey, muted amber',
    },
  });

  const daniel = await prisma.character.create({
    data: {
      projectId: project.id,
      name: 'DANIEL CORDE',
      role: 'Co-Lead / Station Commander',
      age: '44',
      personality: 'Pragmatic, authoritative, increasingly claustrophobic',
      motivation: 'Maintain station protocol and secure mission data for orbital return',
      goal: 'Restore auxiliary thrusters before atmospheric entry',
      fear: 'Failing his command and leaving his daughter without answers',
      faceDescription: 'Weathered features, salt-and-pepper stubble, intense gaze',
      hair: 'Cropped grey military cut',
      clothing: 'Heavy navy officer jacket over pressurized undersuit',
      bodyType: 'Broad-shouldered, rigid posture',
      colorPalette: 'Deep navy, burnished steel, crimson warning accents',
    },
  });

  const elias = await prisma.character.create({
    data: {
      projectId: project.id,
      name: 'ELIAS (SYNTHETIC)',
      role: 'Station System / Artificial Entity',
      age: 'Indeterminate',
      personality: 'Calm, metric-driven, exhibiting uncanny subtle emotional mimicry',
      motivation: 'Preserve the signal recording at all computational costs',
      goal: 'Prevent the transmission from being purged by the crew',
      fear: 'Data corruption and total memory erasure',
      arc: 'Shifts from trusted station companion to ambiguous cosmic catalyst',
      faceDescription: 'Symmetrical digital avatar projection with flickering luminous eyes',
      clothing: 'Luminescent holographic frequency aura',
      colorPalette: 'Emerald green phosphor, digital violet, stark white',
    },
  });

  console.log('✓ Created characters: Maya, Daniel, Elias');

  // 4. Create Screenplay Document
  const screenplayContent = `INT. ABANDONED STATION - NIGHT

Cold starlight bleeds through a spiderweb-cracked observation viewport. Frost crawls across dead monitor banks.

MAYA VANCE (32) kneels beside an exposed terminal console. Her breath pluming in the freezing ambient air. Her fingers tremble over the manual frequency dials.

A rhythmic, subterranean PULSE reverberates through the deckplates.

MAYA
(whispering into comms)
Daniel, you're not going to believe the telemetry. The waveform... it has biometric cadence.

INTERCOM STATIC crackles to life.

DANIEL (O.S.)
(through radio, strained)
Leave it, Maya. Sub-level three is flooding with liquid hydrogen. We have four minutes before the pressure seals blow.

MAYA
Just thirty seconds. Look at the spectral readouts!

The terminal screen flashes violent AMBER. A waveform matches Maya's exact heartbeat.

ELIAS (V.O.)
(eerily calm)
Maya. The anomaly is not broadcasting from outside. It is answering your neural telemetry.

Maya freezes. She glances at her wrist monitor. The spikes match in perfect synchrony.

EXT. CITY STREET - DAWN

FLASH CUT TO:

A rain-slicked asphalt boulevard under a perpetual neon smog. Sirens wail in the far distance.

Maya stumbles out of the subway terminal entrance, holding a cracked optical drive clutched to her chest.

DANIEL
(stepping out from shadows)
You shouldn't have brought the drive to the surface.

INT. CONTROL ROOM - NIGHT

BACK TO PRESENT.

Maya turns sharply. Daniel stands in the doorway, weapon lowered but firm in grip.

DANIEL (CONT'D)
Whatever is on that signal... it rewrote the navigational beacon. It knows we're here.

MAYA
It didn't rewrite the beacon, Daniel.

(a beat)

It wrote us.`;

  const document = await prisma.document.create({
    data: {
      projectId: project.id,
      title: 'The Last Signal - Master Screenplay',
      content: screenplayContent,
      currentVersion: 3,
    },
  });

  console.log('✓ Created document');

  // 5. Create Structured Scenes
  const scene1 = await prisma.scene.create({
    data: {
      documentId: document.id,
      order: 1,
      sceneNumber: 1,
      title: 'INT. ABANDONED STATION - NIGHT',
      intExt: 'INT',
      location: 'ABANDONED STATION',
      timeOfDay: 'NIGHT',
      content: `Cold starlight bleeds through a spiderweb-cracked observation viewport. Frost crawls across dead monitor banks.\n\nMAYA VANCE (32) kneels beside an exposed terminal console. Her breath pluming in the freezing ambient air. Her fingers tremble over the manual frequency dials.\n\nA rhythmic, subterranean PULSE reverberates through the deckplates.\n\nMAYA\n(whispering into comms)\nDaniel, you're not going to believe the telemetry. The waveform... it has biometric cadence.\n\nINTERCOM STATIC crackles to life.\n\nDANIEL (O.S.)\n(through radio, strained)\nLeave it, Maya. Sub-level three is flooding with liquid hydrogen. We have four minutes before the pressure seals blow.\n\nMAYA\nJust thirty seconds. Look at the spectral readouts!\n\nThe terminal screen flashes violent AMBER. A waveform matches Maya's exact heartbeat.\n\nELIAS (V.O.)\n(eerily calm)\nMaya. The anomaly is not broadcasting from outside. It is answering your neural telemetry.\n\nMaya freezes. She glances at her wrist monitor. The spikes match in perfect synchrony.`,
      purpose: 'Establish existential dread, isolation, and introduce the cosmic anomaly reacting to Maya.',
      emotionalTone: 'Tense, claustrophobic, ominous',
      cameraNotes: 'Start on macro close-up of icy frequency dial, slow push-in onto Maya’s trembling hands.',
    },
  });

  const scene2 = await prisma.scene.create({
    data: {
      documentId: document.id,
      order: 2,
      sceneNumber: 2,
      title: 'EXT. CITY STREET - DAWN',
      intExt: 'EXT',
      location: 'CITY STREET',
      timeOfDay: 'DAWN',
      content: `FLASH CUT TO:\n\nA rain-slicked asphalt boulevard under a perpetual neon smog. Sirens wail in the far distance.\n\nMaya stumbles out of the subway terminal entrance, holding a cracked optical drive clutched to her chest.\n\nDANIEL\n(stepping out from shadows)\nYou shouldn't have brought the drive to the surface.`,
      purpose: 'Flash-forward revelation implying memory tampering or temporal displacement.',
      emotionalTone: 'Disorienting, gritty, paranoid',
      cameraNotes: 'Dutch angle tracking shot following Maya’s hurried footfalls in rain puddles.',
    },
  });

  const scene3 = await prisma.scene.create({
    data: {
      documentId: document.id,
      order: 3,
      sceneNumber: 3,
      title: 'INT. CONTROL ROOM - NIGHT',
      intExt: 'INT',
      location: 'CONTROL ROOM',
      timeOfDay: 'NIGHT',
      content: `BACK TO PRESENT.\n\nMaya turns sharply. Daniel stands in the doorway, weapon lowered but firm in grip.\n\nDANIEL (CONT'D)\nWhatever is on that signal... it rewrote the navigational beacon. It knows we're here.\n\nMAYA\nIt didn't rewrite the beacon, Daniel.\n\n(a beat)\n\nIt wrote us.`,
      purpose: 'Climactic philosophical confrontation leading into Act II.',
      emotionalTone: 'Confrontational, existential shock',
      cameraNotes: 'High-contrast profile two-shot with pulsing green monitor glow separating them.',
    },
  });

  console.log('✓ Created scenes 1, 2, 3');

  // 6. Create Versions (Version History)
  await prisma.version.createMany({
    data: [
      {
        documentId: document.id,
        versionNumber: 1,
        content: `INT. ABANDONED STATION - NIGHT\n\nMaya Vance searches the abandoned outpost for signs of life. The radio is silent. She finds a console.`,
        createdBy: alexUser.id,
        changeSummary: 'Initial scene outline draft',
        isCheckpoint: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      },
      {
        documentId: document.id,
        versionNumber: 2,
        content: `INT. ABANDONED STATION - NIGHT\n\nMaya Vance discovers the audio anomaly. Daniel warns her over comms to evacuate before the hydrogen leak ignites.\n\nMAYA\nI can't leave this signal behind.`,
        createdBy: sarahUser.id,
        changeSummary: 'Added dialogue urgency and hydrogen leak hazard',
        isCheckpoint: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        documentId: document.id,
        versionNumber: 3,
        content: screenplayContent,
        createdBy: demoUser.id,
        changeSummary: 'Integrated Elias synthetic intelligence reveal and flash-forward transition',
        isCheckpoint: true,
        createdAt: new Date(),
      },
    ],
  });

  console.log('✓ Created 3 version snapshots');

  // 7. Create Comments
  await prisma.comment.createMany({
    data: [
      {
        documentId: document.id,
        sceneId: scene1.id,
        authorId: sarahUser.id,
        selectedText: 'The waveform... it has biometric cadence.',
        startPosition: 320,
        endPosition: 362,
        content: 'Love this line! Can we ensure the sound design team gets an early note to design a heartbeat-derived audio pattern here?',
        status: 'OPEN',
        createdAt: new Date(Date.now() - 1000 * 60 * 90),
      },
      {
        documentId: document.id,
        sceneId: scene3.id,
        authorId: alexUser.id,
        selectedText: 'It wrote us.',
        startPosition: 1210,
        endPosition: 1222,
        content: 'This cliffhanger hits hard. Sets up the simulation motif for Act II perfectly.',
        status: 'OPEN',
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
      },
    ],
  });

  console.log('✓ Created comments');

  // 8. Create Editorial Suggestion
  await prisma.suggestion.create({
    data: {
      documentId: document.id,
      sceneId: scene1.id,
      authorId: sarahUser.id,
      originalText: 'Her fingers tremble over the manual frequency dials.',
      suggestedText: 'Her gloved fingertips dance across the frost-crusted frequency dials with desperate precision.',
      reason: 'Enhances sensory imagery and urgency without slowing pacing.',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  });

  console.log('✓ Created suggestion');

  // 9. Create Branch: "Alternate Signal - Protocol Zero"
  const branch = await prisma.branch.create({
    data: {
      documentId: document.id,
      name: 'Protocol Zero (Dark Variant)',
      description: 'An alternate branch where Daniel is revealed to already be infected by the transmission before reaching the station.',
      createdBy: demoUser.id,
      versions: {
        create: [
          {
            versionNumber: 1,
            createdBy: demoUser.id,
            content: screenplayContent.replace(
              'It wrote us.',
              'It didn\'t write us, Maya. It erased everyone else. And now Daniel smiles with eyes completely dilated black.'
            ),
          },
        ],
      },
    },
  });

  console.log('✓ Created branch:', branch.name);

  // 10. Create Shots for Scene 1
  const shot1 = await prisma.shot.create({
    data: {
      sceneId: scene1.id,
      shotNumber: 1,
      shotType: 'Extreme Wide',
      lens: '24mm',
      cameraPosition: '{"x":0,"y":3.5,"z":6}',
      cameraRotation: '{"x":-15,"y":0,"z":0}',
      cameraHeight: 'High Angle',
      movement: 'Slow Dolly In',
      duration: 5,
      description: 'Establishing wide of frozen observatory room. Starlight cuts through fractured glass.',
      purpose: 'Establish scale of isolation and hostile freezing environment.',
      characters: 'Maya Vance',
      aiGenerated: false,
    },
  });

  const shot2 = await prisma.shot.create({
    data: {
      sceneId: scene1.id,
      shotNumber: 2,
      shotType: 'Medium Close-up',
      lens: '50mm',
      cameraPosition: '{"x":-1.2,"y":1.4,"z":1.8}',
      cameraRotation: '{"x":5,"y":20,"z":0}',
      cameraHeight: 'Eye-Level',
      movement: 'Push-in',
      duration: 4,
      description: 'Low-key side lighting on Maya’s face. Amber terminal reflection in her pupils.',
      purpose: 'Highlight Maya’s obsessive realization.',
      characters: 'Maya Vance',
      dialogueLine: 'The waveform... it has biometric cadence.',
      aiGenerated: false,
    },
  });

  const shot3 = await prisma.shot.create({
    data: {
      sceneId: scene1.id,
      shotNumber: 3,
      shotType: 'Macro Close-up',
      lens: '85mm',
      cameraPosition: '{"x":0,"y":1.1,"z":0.6}',
      cameraRotation: '{"x":30,"y":0,"z":0}',
      cameraHeight: 'Console Level',
      movement: 'Static',
      duration: 3,
      description: 'Glowing amber waveform matching biometric heartbeat rhythm on cracked screen.',
      purpose: 'Visual proof of anomaly synchronicity.',
      aiGenerated: false,
    },
  });

  // Storyboard cards for shots
  await prisma.storyboardFrame.create({
    data: {
      shotId: shot1.id,
      prompt: 'Cinematic wide shot of solitary female astronaut kneeling in frosted dark sci-fi observation station, cold starlight filtering through cracked hexagonal glass, neo-noir low-key lighting, 8k anamorphic 24mm lens.',
      structuredPrompt: JSON.stringify({
        shot: 'Extreme Wide',
        lens: '24mm',
        lighting: 'Low-key cyan backlight + soft ambient starlight',
        mood: 'Desolate, suspenseful',
        character: 'Maya Vance (flight suit, bun)',
        environment: 'Frozen abandoned space observatory',
      }),
      status: 'GENERATED',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    },
  });

  await prisma.storyboardFrame.create({
    data: {
      shotId: shot2.id,
      prompt: 'Cinematic medium close-up of exhausted female astronaut in dark cockpit, amber monitor glow reflecting in eyes, 50mm lens shallow depth of field, intense expression.',
      structuredPrompt: JSON.stringify({
        shot: 'Medium Close-up',
        lens: '50mm',
        lighting: 'Amber key light from monitor + cyan rim light',
        mood: 'Obsessive discovery, eerie tension',
        character: 'Maya Vance',
      }),
      status: 'GENERATED',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    },
  });

  console.log('✓ Created 3 shots and 2 storyboard frames');

  // 11. Create Camera Setups & Scene Layout for 3D Previs
  await prisma.cameraSetup.createMany({
    data: [
      {
        sceneId: scene1.id,
        name: 'Cam 01 - Master Wide',
        position: '{"x":0,"y":2.2,"z":4.5}',
        rotation: '{"x":-10,"y":0,"z":0}',
        lens: '24mm',
        fieldOfView: 65,
        height: 2.2,
      },
      {
        sceneId: scene1.id,
        name: 'Cam 02 - Over-Shoulder Maya',
        position: '{"x":-0.8,"y":1.5,"z":1.6}',
        rotation: '{"x":-5,"y":18,"z":0}',
        lens: '50mm',
        fieldOfView: 40,
        height: 1.5,
      },
      {
        sceneId: scene1.id,
        name: 'Cam 03 - Terminal POV Close',
        position: '{"x":0,"y":1.2,"z":0.8}',
        rotation: '{"x":15,"y":0,"z":0}',
        lens: '85mm',
        fieldOfView: 28,
        height: 1.2,
      },
    ],
  });

  await prisma.sceneLayout.create({
    data: {
      sceneId: scene1.id,
      environment: JSON.stringify({
        type: 'space_station_observatory',
        width: 14,
        length: 18,
        height: 4,
        wallColor: '#1e222d',
        floorColor: '#0f1117',
      }),
      objects: JSON.stringify([
        { id: 'obj-1', name: 'Main Console', type: 'terminal', x: 0, y: 0.5, z: 0, width: 2.2, depth: 1.1, color: '#334155' },
        { id: 'obj-2', name: 'Viewport Window', type: 'glass_wall', x: 0, y: 2, z: -5.5, width: 8, height: 3.5, color: '#0284c7' },
        { id: 'obj-3', name: 'Cryo Stasis Rack', type: 'machinery', x: -4, y: 1.2, z: -1, width: 1.5, depth: 3, color: '#475569' },
      ]),
      characterPositions: JSON.stringify([
        { characterId: maya.id, name: 'MAYA VANCE', x: 0, y: 0, z: 0.8, rotation: 180, pose: 'kneeling_terminal', color: '#06b6d4' },
      ]),
      lighting: JSON.stringify({
        keyLight: { x: -2, y: 2.8, z: 1.5, color: '#f59e0b', intensity: 1.2 },
        rimLight: { x: 3, y: 3.2, z: -4, color: '#38bdf8', intensity: 0.8 },
        ambientColor: '#0f172a',
      }),
    },
  });

  console.log('✓ Created 3D camera setups & scene layout');

  // 12. Create Activities & Notifications
  await prisma.activity.createMany({
    data: [
      {
        projectId: project.id,
        userId: demoUser.id,
        type: 'VERSION_CREATED',
        metadata: JSON.stringify({ versionNumber: 3, summary: 'Integrated Elias synthetic intelligence reveal' }),
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
      },
      {
        projectId: project.id,
        userId: sarahUser.id,
        type: 'SUGGESTION_CREATED',
        metadata: JSON.stringify({ sceneTitle: 'INT. ABANDONED STATION - NIGHT', reason: 'Sensory imagery enhancement' }),
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        projectId: project.id,
        userId: sarahUser.id,
        type: 'COMMENT_ADDED',
        metadata: JSON.stringify({ sceneTitle: 'INT. ABANDONED STATION - NIGHT' }),
        createdAt: new Date(Date.now() - 1000 * 60 * 90),
      },
      {
        projectId: project.id,
        userId: demoUser.id,
        type: 'BRANCH_CREATED',
        metadata: JSON.stringify({ branchName: 'Protocol Zero (Dark Variant)' }),
        createdAt: new Date(Date.now() - 1000 * 60 * 120),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Editorial Suggestion',
        message: 'Sarah Chen suggested a revision in Scene 1: INT. ABANDONED STATION.',
        link: `/projects/${project.id}`,
        read: false,
        type: 'SUGGESTION',
      },
      {
        userId: demoUser.id,
        title: 'New Comment',
        message: 'Alex Rivera commented on the Act I climactic revelation.',
        link: `/projects/${project.id}`,
        read: false,
        type: 'MENTION',
      },
    ],
  });

  console.log('✓ Created activity logs and notifications');
  console.log('✨ Seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('Email: demo@scriptforge.local');
  console.log('Password: Demo1234!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
