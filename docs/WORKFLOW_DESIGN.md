# ScriptForge: End-to-End Workflow Design & Architecture

ScriptForge transforms the traditional fragmented screenwriting process into a unified, real-time creative-to-production pipeline. This document defines the **system workflows**, **user journeys**, **role swimlanes**, and **data pipelines** that drive the platform.

---

## 1. Master Creative & Pre-Production Workflow

```mermaid
flowchart TD
    subgraph STAGE_1 ["1. Ideation & Inception"]
        A[User Seed Idea / Logline] --> B[AI Story Studio Engine]
        B --> C[Story Concept & Themes]
        C --> D[Three-Act Narrative Structure]
        D --> E[Character Profiles & Visuals]
        E --> F[Automated Master Script Outline]
    end

    subgraph STAGE_2 ["2. Collaborative Writing"]
        F --> G[Tiptap Structured Screenplay Canvas]
        G --> H{Multi-User Editing}
        H -->|Live Typing| I[Socket.IO Real-Time Sync]
        H -->|Tab Cycling| J[WGA Screenplay Block Formatting]
        I & J --> K[Debounced Auto-Save & Local Fallback]
    end

    subgraph STAGE_3 ["3. Review & Editorial Feedback"]
        K --> L[Select Text in Script]
        L --> M[Inline Comment Thread]
        L --> N[Track Changes Suggestion]
        M --> O{Writer/Owner Review}
        N --> P{Accept or Reject Diff}
        P -->|Accept| Q[Auto-Patch Script & Log Activity]
        P -->|Reject| R[Archive Suggestion]
        O -->|Resolve| S[Archive Comment]
    end

    subgraph STAGE_4 ["4. Versioning & Story Branching"]
        Q --> T[Version Checkpoint Snapshot]
        T --> U{Explore Alternate Plot?}
        U -->|Yes| V[Fork Story Branch: e.g. Protocol Zero]
        V --> W[Edit Branch Independently]
        W --> X[Visual Diff & Branch Comparison]
        X --> Y[Merge Branch Back into Master]
        U -->|No| Z[Safe Non-Destructive Restore if needed]
    end

    subgraph STAGE_5 ["5. AI Direction & Previsualization"]
        T & Y --> AA[Select Scene for Direction]
        AA --> AB[AI Scene Director Analysis]
        AB --> AC[AI Cinematographer / Lens Guidance]
        AC --> AD[Automated Production Shot List]
        AD --> AE[2.5D Top-Down Set Blocking Canvas]
        AE --> AF[Deterministic Real-Time Camera Simulator]
        AF --> AG[Storyboard Frame Generation]
    end

    subgraph STAGE_6 ["6. Production Delivery & Exports"]
        AG --> AH{Select Delivery Target}
        AH --> AI[WGA Screenplay PDF - Courier 12pt]
        AH --> AJ[Final Draft FDX XML with Tags]
        AH --> AK[Microsoft Word DOCX]
        AH --> AL[Pure Fountain Format]
        AH --> AM[Production Shot List & Storyboard PDF]
    end
```

---

## 2. Multi-Role Collaboration Swimlane

ScriptForge enforces server-side Role-Based Access Control (RBAC) across **Owner**, **Writer**, **Editor**, and **Viewer**.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Project Owner / Director
    actor Writer as Staff Writer
    actor Editor as Story Editor
    actor AI as ScriptForge AI (Groq)
    participant Platform as ScriptForge Studio Engine
    participant DB as Relational DB & Storage

    %% Stage 1: Setup & Writing
    Owner->>Platform: Create Project / Run AI Story Studio
    AI-->>Platform: Generate Concept, 3 Acts, Characters & Screenplay
    Owner->>Platform: Invite Writer (WRITER) & Editor (EDITOR)
    Writer->>Platform: Join Room via WebSocket
    Platform-->>Owner: Render Live Presence & Cursors

    %% Stage 2: Drafting & Collaboration
    loop Active Writing Session
        Writer->>Platform: Type dialogue / Tab-cycle blocks
        Platform->>DB: Debounced Autosave (800ms)
        Platform-->>Owner: Broadcast delta & cursor position
    end

    %% Stage 3: Review & Suggestions
    Editor->>Platform: Select line & submit editorial Suggestion
    Platform->>DB: Save Suggestion (Status: PENDING)
    Platform-->>Writer: Show green/red visual diff in Review Drawer
    Writer->>Platform: Accept Suggestion
    Platform->>DB: Patch Screenplay Content & Mark ACCEPTED
    Platform->>DB: Auto-create Version Checkpoint & Activity Log

    %% Stage 4: Previs & Direction
    Owner->>Platform: Trigger "Direct This Scene"
    Platform->>AI: Send Scene Content + Character Profiles
    AI-->>Platform: Return Lighting, Intent, Camera Setups & Shot List
    Owner->>Platform: Open 3D Camera Previs
    Platform->>Platform: Real-time Camera Simulation (24mm -> 85mm, FOV, Dragging)
    Owner->>Platform: Export Shot List & Screenplay FDX / PDF
```

---

## 3. Stage-by-Stage Operational Specification

### Stage 1: Inception & AI Story Studio
1. **Input**: Logline or premise (e.g. *"A psychological sci-fi thriller about an isolated communications officer who intercepts a transmission predicting her crew's immediate deaths"*).
2. **AI Orchestration**:
   - Analyzes genre, tone, and audience demographics.
   - Deconstructs the narrative into **Act I (Setup & Catalyst)**, **Act II (Confrontation & Crisis)**, and **Act III (Resolution)**.
   - Builds complete **Character Profiles** with psychological traits and visual consistency descriptors (face, wardrobe, color palette).
   - Generates the initial **Master Screenplay Draft**.
3. **Transition**: Automatically creates the project and opens the writing workspace.

---

### Stage 2: Structured Screenplay Drafting & Live Collaboration
1. **Screenplay Engine**:
   - Strict block hierarchy: `Scene Heading` (`INT./EXT.`), `Action`, `Character`, `Dialogue`, `Parenthetical`, `Transition`.
   - **Tab Key Cycling**:
     - `Scene Heading` $\rightarrow$ `Action` $\rightarrow$ `Character` $\rightarrow$ `Dialogue` $\rightarrow$ `Parenthetical`.
     - `Shift + Tab` cycles in reverse.
   - Page estimation engine continuously computes screenplay running time ($1\text{ page} \approx 1\text{ minute} \approx 55\text{ lines}$).
2. **Real-Time Sync**:
   - Socket.IO rooms bind collaborators to `doc:<documentId>`.
   - Live presence avatars in header show active users, current scene locations, and colored cursors.
   - Conflict-resilient delta updates prevent overwriting.
3. **Autosave Pipeline**:
   - Debounced at 800ms to minimize database churn.
   - Displays real-time states: `Saving...` $\rightarrow$ `✓ Saved` $\rightarrow$ `Offline local fallback`.

---

### Stage 3: Editorial Feedback & Suggestions Engine
1. **Inline Comments**:
   - Highlighting any text opens the floating bubble menu $\rightarrow$ **Comment**.
   - Anchored with character offsets (`startPosition`, `endPosition`) and scene ID.
   - Threaded replies, timestamps, and `Resolve` / `Reopen` lifecycle.
2. **Track Changes Suggestions**:
   - Reviewers/Editors propose modifications without directly altering master text.
   - Highlights: **Green additions**, **Red strikethrough deletions**.
   - **Accept Action**: Instantly replaces the text in the master document, bumps the version number, and logs activity.
   - **Reject Action**: Dismisses the proposal while keeping audit trails.

---

### Stage 4: Version Control & Story Branching
1. **Version History**:
   - Checkpoints triggered manually or automatically upon major editorial actions.
   - Side-by-side **Visual Diff Viewer** (`Previous Version` vs. `Current Version`).
   - **Safe Non-Destructive Restore**: Restoring an earlier draft creates a **new** version (e.g. `Version 25: Restored from Version 21`), ensuring no historical work is ever lost.
2. **Story Branching System**:
   - Create alternate storylines (e.g. *"Branch A: Maya stays on station"*, *"Branch B: Protocol Zero"*).
   - Visual Story Tree UI displays active branch state.
   - Isolated branch editing $\rightarrow$ **Compare Branches** $\rightarrow$ **Merge Branch into Main**.

---

### Stage 5: Cinematic Previsualization & AI Directing
1. **AI Scene Director**:
   - Generates scene intent, subtext, lighting color temperatures, practical lights, and soundscapes.
2. **AI Cinematographer**:
   - Provides DP advice on focal lengths, depth of field, and camera movement (e.g. *Push-in on Dana dolly*).
3. **Interactive Set Blocking (2.5D Floor Plan)**:
   - Draggable actors, camera frustums, and furniture/props.
4. **Deterministic Camera Simulation**:
   - Perspective viewport runs in real-time in the browser.
   - Instant focal length adjustments (`24mm`, `35mm`, `50mm`, `85mm`, `135mm`) with zero network latency.
5. **Storyboard Frame Generation**:
   - Structured JSON prompt synthesis (`shot`, `lens`, `lighting`, `mood`, `character visual profile`, `environment`) fed into image providers.

---

### Stage 6: Production Planning & Exports
1. **Screenplay PDF**: Industry-standard Courier 12pt format, exact WGA margins (left 1.5", right 1.0"), title page, and page numbers.
2. **Final Draft (FDX XML)**: Valid structural XML with native `<SceneHeading>`, `<Action>`, `<Character>`, `<Dialogue>` tags.
3. **Microsoft Word (DOCX)**: Styled document for table reads and production annotations.
4. **Fountain**: Clean plain-text markup for specialized mobile and desktop apps.
5. **Shot List & Storyboard PDF**: Production table for directors, camera operators, and 1st ADs on set.

---

## 4. State Transition Diagrams

### Comment & Suggestion Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING_SUGGESTION : Editor suggests text edit
    [*] --> OPEN_COMMENT : User adds comment
    
    OPEN_COMMENT --> RESOLVED_COMMENT : Resolve button clicked
    RESOLVED_COMMENT --> OPEN_COMMENT : Reopen comment
    OPEN_COMMENT --> [*] : Deleted by author/owner
    
    PENDING_SUGGESTION --> ACCEPTED_SUGGESTION : Writer/Owner Accepts
    PENDING_SUGGESTION --> REJECTED_SUGGESTION : Writer/Owner Rejects
    
    ACCEPTED_SUGGESTION --> SCRIPT_UPDATED : Auto-patch document text
    SCRIPT_UPDATED --> VERSION_SNAPSHOT : Auto-create version checkpoint
```

### Story Branch Lifecycle

```mermaid
stateDiagram-v2
    [*] --> MASTER_DOCUMENT : Master Screenplay
    MASTER_DOCUMENT --> BRANCH_CREATED : Fork new branch (inherit state)
    BRANCH_CREATED --> BRANCH_EDITING : Writers edit alternate plot
    BRANCH_EDITING --> BRANCH_SAVED : Save branch version checkpoint
    BRANCH_SAVED --> BRANCH_COMPARE : Compare with Master Draft
    BRANCH_COMPARE --> BRANCH_MERGED : Merge selected content into Master
    BRANCH_MERGED --> MASTER_DOCUMENT : Master updated with new checkpoint
```

---

## 5. Summary of System Benefits

- **Zero Context Switching**: Writers draft, directors block scenes, and editors leave notes in a single unified workspace.
- **Data Safety**: Debounced autosaving, non-destructive version restores, and branch isolation eliminate lost work.
- **Fast Execution**: Real-time camera simulator runs deterministically in the client, reserving Groq AI for deep creative reasoning and structured planning.
