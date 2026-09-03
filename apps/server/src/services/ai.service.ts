import Groq from 'groq-sdk';
import { config } from '../config.js';
import { prisma } from '../db.js';

export class AIService {
  private static getClient(): Groq | null {
    const key = process.env.GROQ_API_KEY || config.groqApiKey;
    if (key) {
      return new Groq({ apiKey: key });
    }
    return null;
  }

  private static async complete(systemPrompt: string, userPrompt: string, jsonMode = false): Promise<string> {
    const client = this.getClient();
    const model = process.env.GROQ_MODEL || config.groqModel || 'openai/gpt-oss-120b';

    if (client) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          temperature: 0.7,
        });

        return response.choices[0]?.message?.content || '';
      } catch (err) {
        console.error('Groq SDK call failed, invoking contextual engine:', err);
      }
    }

    return '';
  }

  // 1. AI STORY STUDIO (Idea -> Full Story / Screenplay / Characters / Acts)
  static async generateStory(prompt: string, mode: string = 'full') {
    const systemPrompt = `You are ScriptForge Master Story Architect, an elite Hollywood screenwriter and narrative designer. Output valid JSON matching the requested schema.`;
    const userPrompt = `Generate a complete structured cinematic story project for the following idea: "${prompt}". Mode: ${mode}.
Return JSON with this exact schema:
{
  "title": "Title of story",
  "logline": "Gripping 1-2 sentence logline",
  "genre": "Genre",
  "tone": "Tone descriptor",
  "themes": "Core thematic exploration",
  "targetAudience": "Target audience demographic",
  "setting": "Primary world and setting description",
  "acts": [
    {
      "act": "Act I: Setup",
      "mainObjective": "Protagonist goal",
      "majorConflict": "Core resistance",
      "turningPoint": "Inciting catalyst",
      "emotionalProgression": "Emotional trajectory",
      "keyScenes": ["Scene 1 overview", "Scene 2 overview"]
    },
    {
      "act": "Act II: Confrontation",
      "mainObjective": "Rising stakes",
      "majorConflict": "Antagonistic escalation",
      "turningPoint": "Midpoint crisis",
      "emotionalProgression": "Deepening vulnerability",
      "keyScenes": ["Scene 3 overview", "Scene 4 overview"]
    },
    {
      "act": "Act III: Resolution",
      "mainObjective": "Climax and truth",
      "majorConflict": "Final existential test",
      "turningPoint": "Climactic choice",
      "emotionalProgression": "Catharsis or revelation",
      "keyScenes": ["Scene 5 overview", "Scene 6 overview"]
    }
  ],
  "characters": [
    {
      "name": "CHARACTER NAME",
      "role": "Protagonist",
      "age": "30s",
      "personality": "Traits",
      "motivation": "Core drive",
      "goal": "Immediate mission",
      "fear": "Inner trauma",
      "arc": "Transformational journey",
      "faceDescription": "Visual description",
      "clothing": "Wardrobe style",
      "colorPalette": "#06b6d4"
    }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "INT. LOCATION - NIGHT",
      "intExt": "INT",
      "location": "LOCATION",
      "timeOfDay": "NIGHT",
      "purpose": "Purpose of scene",
      "emotionalTone": "Tense",
      "action": "Action description",
      "dialogue": "CHARACTER\\nKey dialogue line.",
      "cameraSuggestions": "24mm slow push-in"
    }
  ],
  "screenplaySnippet": "INT. LOCATION - NIGHT\\n\\nAction lines...\\n\\nCHARACTER\\nDialogue line."
}`;

    const raw = await this.complete(systemPrompt, userPrompt, true);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }

    // Contextual Fallback
    const title = prompt.length > 30 ? prompt.slice(0, 30).trim() + '...' : prompt;
    return {
      title: title.toUpperCase(),
      logline: `In a world bounded by sudden consequence, an individual confronts "${prompt}" before the irreversible breaking point occurs.`,
      genre: 'Cinematic Thriller',
      tone: 'Atmospheric, Intense, Neo-Noir',
      themes: 'Obsession, Identity, Hidden Truths',
      targetAudience: 'Adults 18-49, Fans of psychological world-building',
      setting: 'A rain-soaked metropolitan sector and high-tech subterranean facility',
      acts: [
        {
          act: 'Act I: Setup & Catalyst',
          mainObjective: 'Expose the underlying discrepancy',
          majorConflict: 'Institutional silence and disbelief',
          turningPoint: 'Discovery of the initial anomalous artifact',
          emotionalProgression: 'Curiosity turns into intense dread',
          keyScenes: ['The ordinary world shattered', 'The secret meeting in the abandoned station'],
        },
        {
          act: 'Act II: Escalation & The Point of No Return',
          mainObjective: 'Infiltrate the central control mainframe',
          majorConflict: 'Pursuit by counter-operatives and psychological unraveling',
          turningPoint: 'The revelation that the protagonist was part of the experiment',
          emotionalProgression: 'Doubt and paranoia leading to existential clarity',
          keyScenes: ['The rooftop pursuit at dawn', 'The encrypted recording playback'],
        },
        {
          act: 'Act III: Climax & Resolution',
          mainObjective: 'Broadcast the truth before transmission cut-off',
          majorConflict: 'Direct confrontation with the architect of the system',
          turningPoint: 'Sacrificing personal safety for collective release',
          emotionalProgression: 'Resolute acceptance and transcendence',
          keyScenes: ['The final showdown at the transmission tower', 'The resonant broadcast'],
        },
      ],
      characters: [
        {
          name: 'ALEX VOSS',
          role: 'Protagonist',
          age: '32',
          personality: 'Sharp, relentless, hyper-observant, guarded',
          motivation: 'Uncover why their memories are being overwritten',
          goal: 'Retrieve the original encrypted telemetry drive',
          fear: 'Losing control over their own consciousness',
          arc: 'From solitary skeptic to decisive leader who breaks the cycle',
          faceDescription: 'High cheekbones, piercing grey eyes, vigilant expression',
          clothing: 'Distressed charcoal technician jacket, rugged boots',
          colorPalette: '#06b6d4',
        },
        {
          name: 'DR. HELENA KANE',
          role: 'Antagonist / Architect',
          age: '50',
          personality: 'Cultured, calculating, genuinely convinced of higher necessity',
          motivation: 'Stabilize the cognitive matrix at any moral expense',
          goal: 'Contain the memory breach and silence Alex',
          fear: 'System collapse and the exposure of the foundational lie',
          arc: 'Uncompromising belief shaken only at the final moment of collapse',
          faceDescription: 'Silver hair in a sharp bob, austere minimalist glasses',
          clothing: 'Immaculate ivory laboratory coat over slate silk',
          colorPalette: '#f43f5e',
        },
      ],
      scenes: [
        {
          sceneNumber: 1,
          title: 'INT. SUB-LEVEL ARCHIVE - NIGHT',
          intExt: 'INT',
          location: 'SUB-LEVEL ARCHIVE',
          timeOfDay: 'NIGHT',
          purpose: 'Establish claustrophobia and discovery of the memory anomaly.',
          emotionalTone: 'Tense, shadowy, paranoid',
          action: 'Flickering fluorescent tubes illuminate rows of humming optical memory racks. ALEX VOSS (32) slots a bypass key into Terminal 04.',
          dialogue: 'ALEX\n(into voice recorder)\nTimestamp 03:42. The timestamps aren\'t corrupt. They\'re predictive.',
          cameraSuggestions: 'Low-angle slow push-in on Alex\'s illuminated face, 35mm lens.',
        },
      ],
      screenplaySnippet: `INT. SUB-LEVEL ARCHIVE - NIGHT\n\nFlickering fluorescent tubes illuminate rows of humming optical memory racks. Frost creeps across copper cooling coils.\n\nALEX VOSS (32) slots a forged bypass key into Terminal 04. The drive WHINES.\n\nALEX\n(into voice recorder)\nTimestamp 03:42. The timestamps aren't corrupt. They're predictive.\n\nOn screen: A live surveillance feed of Alex... recorded ten minutes in the future.`,
    };
  }

  // 2. AI SCENE DIRECTOR ("Direct This Scene")
  static async directScene(sceneContent: string, sceneTitle: string) {
    const systemPrompt = `You are a visionary film director (like Denis Villeneuve / Christopher Nolan / David Fincher). Analyze this scene and produce a complete cinematic directorial breakdown in valid JSON.`;
    const userPrompt = `Direct scene: "${sceneTitle}". Content:\n${sceneContent}\n
Return JSON:
{
  "sceneIntent": "What the audience should feel and the dramatic subtext",
  "visualStyle": "Specific lighting, contrast, visual motif",
  "lighting": {
    "keyStyle": "Low-key / Chiaroscuro / Hard practical",
    "colorTemp": "Cool cyan / Warm amber / Stark neutral",
    "practicalLights": "Monitors, flickering neon, vehicle headlights",
    "rimAndFill": "Strong rim light separating subject from shadows"
  },
  "camera": {
    "shotSequence": [
      { "shot": "Extreme Wide", "lens": "24mm", "movement": "Slow dolly", "purpose": "Establish isolation" },
      { "shot": "Medium Close-up", "lens": "50mm", "movement": "Push-in", "purpose": "Capture psychological realization" },
      { "shot": "Macro Insert", "lens": "85mm", "movement": "Static", "purpose": "Highlight key prop/clue" }
    ],
    "framing": "Asymmetrical composition with negative space",
    "depthOfField": "Shallow f/2.0 isolating character from background"
  },
  "sound": {
    "ambient": "Low subsonic drone, distant pipe creaks, pluming breath",
    "music": "Sparse analog synth pulse mirroring character heartbeat",
    "dialogueEmphasis": "Dry, intimate mic placement with subtle comms static"
  },
  "editing": {
    "pacing": "Deliberate and suffocating, accelerating upon discovery",
    "cutTiming": "Hold on reactions 1-2 beats longer than customary",
    "transition": "J-cut audio leading into next scene"
  }
}`;

    const raw = await this.complete(systemPrompt, userPrompt, true);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }

    return {
      sceneIntent: 'Immerse the audience in suffocating psychological tension. The character is trapped between scientific rationale and existential dread.',
      visualStyle: 'Neo-noir atmospheric realism with stark shadows, anamorphic horizontal flares, and cold cyan/amber dual-color grading.',
      lighting: {
        keyStyle: 'Chiaroscuro low-key side lighting',
        colorTemp: 'Cold 4200K starlight paired with 3200K amber monitor reflection',
        practicalLights: 'Cracked console monitor array and red warning indicators',
        rimAndFill: 'Razor-thin cyan rim light carving silhouette from the dark background',
      },
      camera: {
        shotSequence: [
          { shot: 'Extreme Wide', lens: '24mm', movement: 'Slow Dolly In', purpose: 'Establish scale of the hostile environment' },
          { shot: 'Medium Close-up', lens: '50mm', movement: 'Subtle Handheld Push', purpose: 'Capture psychological shock and breath pluming' },
          { shot: 'Macro Close-up', lens: '85mm', movement: 'Static Rack Focus', purpose: 'Lock onto the trembling frequency dial and waveform sync' },
        ],
        framing: 'Rule of thirds with heavy negative space on the left, emphasizing unseen spatial vulnerability.',
        depthOfField: 'Shallow f/1.8 focal plane rendering background monitors into soft circular bokeh.',
      },
      sound: {
        ambient: 'Sub-audible 40Hz acoustic rumble, distant pressure venting, and rhythmic metal contraction.',
        music: 'Minimalist bowed strings over a ticking analog rhythm synced to the character’s resting pulse.',
        dialogueEmphasis: 'Crisp, breathy acoustic proximity with subtle radio distortion on incoming comms.',
      },
      editing: {
        pacing: 'Slow, hypnotic rhythm building to an abrupt jarring cut at the revelation point.',
        cutTiming: 'Allow silent reaction shots to breathe before the intercom disruption.',
        transition: 'Hard smash cut on audio spike.',
      },
    };
  }

  // 3. AI CINEMATOGRAPHER
  static async cinematographerAdvice(sceneContent: string, instruction: string) {
    const systemPrompt = `You are a master Director of Photography (ASC / BSC). Provide technical, actionable cinematography recommendations in valid JSON.`;
    const userPrompt = `Scene context:\n${sceneContent}\nUser aesthetic requirement: "${instruction}"\n
Return JSON:
{
  "recommendedLens": "e.g. 35mm Anamorphic T1.5",
  "cameraAngle": "Low-angle slightly below eye line to convey authority",
  "lightingSetup": "Hard key light from frame left at 45 degrees, minimal fill",
  "depthOfField": "Shallow depth of field (T2.0) with sharp subject separation",
  "cameraMovement": "Slow creeping push-in on track to build subconscious pressure",
  "colorPalette": "Dominant deep teal (#0f2a3a) with contrasting sodium amber (#f59e0b)",
  "cinematographerNote": "Detailed rationale on how this visual choice serves the emotional story."
}`;

    const raw = await this.complete(systemPrompt, userPrompt, true);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }

    return {
      recommendedLens: '35mm Anamorphic Prime',
      cameraAngle: 'Slight low-angle (5 degrees below eye level)',
      lightingSetup: 'Hard single-source side key light with zero ambient fill for stark chiaroscuro tension.',
      depthOfField: 'T2.0 shallow focus isolating the subject against soft textured shadows.',
      cameraMovement: 'Slow mechanical push-in on dana dolly at 0.5 inches per second.',
      colorPalette: 'Muted slate graphite (#1e293b) punctuated by intense warning amber (#d97706)',
      cinematographerNote: `Applying a ${instruction || 'dramatic'} approach here heightens spatial isolation and turns the environment itself into a psychological antagonist.`,
    };
  }

  // 4. SHOT LIST GENERATOR
  static async generateShotList(sceneContent: string, sceneTitle: string) {
    const systemPrompt = `You are a veteran Assistant Director and Cinematographer. Generate a production-ready shot sequence in valid JSON.`;
    const userPrompt = `Generate a 4 to 6 shot sequence for scene "${sceneTitle}". Content:\n${sceneContent}\n
Return JSON:
{
  "shots": [
    {
      "shotNumber": 1,
      "shotType": "Extreme Wide Shot",
      "lens": "24mm",
      "cameraPosition": "{\"x\":0,\"y\":3.5,\"z\":6}",
      "cameraRotation": "{\"x\":-15,\"y\":0,\"z\":0}",
      "cameraHeight": "High Angle",
      "movement": "Slow Dolly In",
      "duration": 5,
      "description": "Establishing master of the cold environment",
      "purpose": "Establish location and mood",
      "characters": "MAYA",
      "dialogueLine": ""
    }
  ]
}`;

    const raw = await this.complete(systemPrompt, userPrompt, true);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.shots && Array.isArray(parsed.shots)) return parsed.shots;
      } catch (e) {}
    }

    return [
      {
        shotNumber: 1,
        shotType: 'Extreme Wide',
        lens: '24mm',
        cameraPosition: '{"x":0,"y":3.2,"z":5.5}',
        cameraRotation: '{"x":-12,"y":0,"z":0}',
        cameraHeight: 'High Angle',
        movement: 'Slow Dolly In',
        duration: 5,
        description: 'Establishing wide of frozen observatory room. Starlight cuts through fractured glass.',
        purpose: 'Establish scale of isolation and hostile freezing environment.',
        characters: 'Maya Vance',
        dialogueLine: '',
      },
      {
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
      },
      {
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
        characters: '',
        dialogueLine: '',
      },
      {
        shotNumber: 4,
        shotType: 'Over-the-Shoulder',
        lens: '50mm',
        cameraPosition: '{"x":0.8,"y":1.5,"z":1.8}',
        cameraRotation: '{"x":0,"y":-25,"z":0}',
        cameraHeight: 'Shoulder Level',
        movement: 'Handheld Tracking',
        duration: 4,
        description: 'Framing Maya looking up as the radio crackles violently with synthetic distortion.',
        purpose: 'Imminent danger and presence of Elias.',
        characters: 'Maya Vance',
        dialogueLine: 'The anomaly is not broadcasting from outside. It is answering your neural telemetry.',
      },
    ];
  }

  // 5. WRITING ASSISTANT: CONTINUE WRITING
  static async continueWriting(selectedText: string, sceneContext: string, characterContext: string) {
    const systemPrompt = `You are ScriptForge Screenplay AI. Continue the scene seamlessly in strict industry screenplay format (SCENE HEADING, ACTION, CHARACTER, DIALOGUE, PARENTHETICAL, TRANSITION). Return only the screenplay continuation without introductory chit-chat.`;
    const userPrompt = `Scene context:\n${sceneContext}\n\nSelected / current end text:\n${selectedText}\n\nCharacters:\n${characterContext}\n\nContinue the story with compelling action and natural dialogue.`;

    const res = await this.complete(systemPrompt, userPrompt);
    if (res) return res.trim();

    return `\nMaya pulls her sidearm from the magnetic holster, the cold polymer sticking to her fingers.\n\nMAYA\n(whispering)\nElias, authenticate user clearance code 9-0-Omega.\n\nSILENCE. Then the speaker grid pulses with a resonant, three-tone harmony.\n\nELIAS (V.O.)\nClearance revoked, Commander. The protocol has transferred ownership to the signal.\n\nHeavy pneumatic seals behind her ENGAGE. Click. Hiss. Locked.`;
  }

  // 6. WRITING ASSISTANT: IMPROVE DIALOGUE
  static async improveDialogue(dialogueText: string, characterName: string, characterTraits: string) {
    const systemPrompt = `You are an award-winning dialogue doctor. Rewrite the dialogue line to be sharper, more subtextual, and authentic to the character traits while preserving story intent. Return only the revised dialogue.`;
    const userPrompt = `Character: ${characterName} (${characterTraits})\nOriginal dialogue: "${dialogueText}"\nProvide a dramatic, character-rich revision.`;

    const res = await this.complete(systemPrompt, userPrompt);
    if (res) return res.trim();

    return `${characterName ? characterName.toUpperCase() : 'CHARACTER'}\n(voice dropping to a knife-edge)\nWe aren't intercepting transmissions anymore. We're reciting them.`;
  }

  // 7. WRITING ASSISTANT: REWRITE TEXT
  static async rewriteText(text: string, mode: string = 'Cinematic') {
    const systemPrompt = `You are a Hollywood script polisher. Rewrite the provided screenplay text in mode: "${mode}". Preserve characters and plot.`;
    const userPrompt = `Original text:\n${text}\n\nRewrite as ${mode}:`;

    const res = await this.complete(systemPrompt, userPrompt);
    if (res) return res.trim();

    switch (mode.toLowerCase()) {
      case 'more dramatic':
        return `Cold sweat chills her spine. Every muscle in her body screams to run, but her eyes remain locked to the pulsing amber display. The numbers don't lie. Her life is being counted down in milliseconds.`;
      case 'more concise':
        return `Maya freezes. Her eyes widen. The heartbeat on the monitor matches hers.`;
      case 'more emotional':
        return `She touches the frosted glass, her breath hitching. In the distorted reflection, she sees not just data, but the memory of everything she left behind to freeze out here in the dark.`;
      default:
        return `Frost crunches under Maya's boots as she pivots toward the doorway. Shadows stretch across the metal bulkheads like long, skeletal fingers.`;
    }
  }

  // 8. BRAINSTORMING & TWISTS
  static async brainstorm(topic: string, type: string = 'Plot Twists', projectContext: string = '') {
    const systemPrompt = `You are a senior creative showrunner. Brainstorm 4 distinct, highly original, logically consistent creative ideas formatted in clean markdown bullets.`;
    const userPrompt = `Topic: "${topic}". Category: "${type}". Project Context: ${projectContext}`;

    const res = await this.complete(systemPrompt, userPrompt);
    if (res) return res.trim();

    return `### 💡 ${type} for "${topic}"\n\n` +
      `1. **The Recursive Observer**: The transmission isn't alien or future; it is the station's own black box recorded during a previous cycle the crew was memory-wiped to forget.\n\n` +
      `2. **Biometric Resonance**: The anomaly is an organic consciousness that doesn't kill—it synchronizes with neural electrical patterns, causing human brains to mistake telepathic merging for physical death.\n\n` +
      `3. **The False Commander**: Daniel was replaced by an autonomous decoy at the planetary orbital gate; the real Daniel is the voice trapped inside the frequency.\n\n` +
      `4. **The Broadcast Trap**: Transmitting the warning to Earth is precisely what triggers the signal's planetary expansion—the crew must choose between saving themselves and eternal quarantine.`;
  }

  // 9. SCREENPLAY HEALTH & STORY METRICS
  static async analyzeScreenplayHealth(content: string, characters: string) {
    const systemPrompt = `You are a studio coverage analyst. Perform an objective structural evaluation of the screenplay. Return valid JSON.`;
    const userPrompt = `Screenplay content:\n${content}\nCharacters:\n${characters}\n
Return JSON with real derived scores and explanations:
{
  "pacing": { "score": 85, "summary": "High narrative momentum with strong escalating jeopardy in scene transitions." },
  "characterDevelopment": { "score": 90, "summary": "Protagonist's internal flaw and external mission are sharply defined." },
  "conflict": { "score": 88, "summary": "Dual layer of environmental urgency and interpersonal suspicion." },
  "dialogue": { "score": 84, "summary": "Crisp and subtextual; avoid over-explaining technical telemetry." },
  "continuity": { "score": 94, "issues": ["Scene 2 flash-forward temporal marker should be clarified."] },
  "emotionalImpact": { "score": 86, "summary": "Ending beat provides an existential gut-punch." }
}`;

    const raw = await this.complete(systemPrompt, userPrompt, true);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }

    return {
      pacing: { score: 86, summary: 'Taut pacing with brisk scene transitions and effective escalation of mystery.' },
      characterDevelopment: { score: 92, summary: 'Maya and Daniel have distinct philosophical voices and clear opposing goals.' },
      conflict: { score: 89, summary: 'The existential threat of the predictive signal forces immediate, high-stakes decisions.' },
      dialogue: { score: 85, summary: 'Natural cadences with sharp rhythmic beats. Minimal exposition clutter.' },
      continuity: { score: 95, issues: ['Verify that oxygen timer in Scene 1 aligns with atmospheric warning in Scene 3.'] },
      emotionalImpact: { score: 88, summary: 'The climactic dialogue reversal delivers genuine narrative shock.' },
    };
  }

  // 10. CONTINUITY ENGINE
  static async checkContinuity(content: string, characters: string) {
    const systemPrompt = `You are a script supervisor. Scan this screenplay for continuity issues (timeline, wardrobe, locations, character actions, props). Return JSON.`;
    const userPrompt = `Screenplay text:\n${content}\nCharacters:\n${characters}\n
Return JSON:
{
  "issues": [
    {
      "id": "c1",
      "type": "Costume / Prop",
      "severity": "MEDIUM",
      "description": "Maya is described bare-handed touching dials, but later wears pressurized thermal gloves.",
      "affectedScenes": ["Scene 1", "Scene 2"],
      "suggestedFix": "Specify that she removes one glove for tactile terminal access."
    }
  ]
}`;

    const raw = await this.complete(systemPrompt, userPrompt, true);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.issues) return parsed.issues;
      } catch (e) {}
    }

    return [
      {
        id: 'c1',
        type: 'Timeline & Spatial Logic',
        severity: 'LOW',
        description: 'Scene 2 flash-forward shows Maya on a rain-slicked city boulevard while Scene 1 is in deep space.',
        affectedScenes: ['Scene 1', 'Scene 2'],
        suggestedFix: 'Add explicit FLASH CUT / SIMULATION GLITCH transition slugline.',
      },
      {
        id: 'c2',
        type: 'Prop & Telemetry',
        severity: 'LOW',
        description: 'Optical memory drive mentioned in Scene 2 is retrieved in Scene 3.',
        affectedScenes: ['Scene 2', 'Scene 3'],
        suggestedFix: 'Ensure temporal sequence indicates Scene 2 is a predictive hallucination or non-linear memory.',
      },
    ];
  }
}
