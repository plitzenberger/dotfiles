# Game Writing Deliverables

Standard deliverables produced in game narrative and story writing projects.

---

## Story Documentation

### Story Bible

Comprehensive reference document for the game's narrative:

- **World Overview** — Setting, tone, themes, genre conventions
- **Timeline** — Key historical events, current situation, future trajectory
- **Rules of the World** — Magic systems, technology, what's possible/impossible
- **Tone Guide** — Emotional range, humor style, darkness level
- **Theme Documentation** — Central questions the narrative explores

### Character Bible

Complete character reference including:

- **Character Profiles** — Background, personality, motivations, arc
- **Relationship Maps** — How characters connect and conflict
- **Voice Guides** — Speech patterns, vocabulary, verbal tics
- **Arc Documentation** — Character journey across the narrative
- **Design Notes** — Guidance for visual design and animation

### Plot Documentation

| Document                | Purpose                              | Contents                                |
| ----------------------- | ------------------------------------ | --------------------------------------- |
| **Story Outline**       | High-level narrative structure       | Act breakdown, major beats, ending(s)   |
| **Scene List**          | All narrative scenes catalogued      | Scene ID, characters, location, purpose |
| **Branch Map**          | Visual representation of story paths | Flowchart of choices and consequences   |
| **State Documentation** | Variables affecting narrative        | What's tracked, how it affects story    |

---

## Script Assets

### Dialogue Scripts

| Format Element        | Standard                                  |
| --------------------- | ----------------------------------------- |
| **Character ID**      | Unique identifier for speaker             |
| **Line ID**           | Unique identifier for localization        |
| **Context Notes**     | Situation, emotion, player state triggers |
| **Direction Notes**   | Performance guidance for voice actors     |
| **Branch Conditions** | When this line appears                    |

Example format:

```
[SCENE_ID: ACT1_VILLAGE_ELDER]
[TRIGGER: Player speaks to Elder after completing Quest_FindArtifact]

ELDER_001_001
ELDER MIRIAM
(relieved, but concerned)
"You found it. By the ancestors, you actually found it."
[DIRECTION: Beat of wonder, then worry creeps in]

ELDER_001_002
ELDER MIRIAM
(grave)
"But bringing it here... do you understand what you've done?"

[BRANCH: IF player_chose_stealth]
ELDER_001_003a
ELDER MIRIAM
"At least you were careful. They may not know it's gone."

[BRANCH: IF player_chose_combat]
ELDER_001_003b
ELDER MIRIAM
"Half the temple guard saw you take it. They'll be coming."
```

### Bark Scripts

Contextual voice lines organized by:

- **Combat Barks** — Battle callouts, damage reactions, kills
- **Exploration Barks** — Environmental comments, discoveries
- **Idle Barks** — Ambient conversation, waiting dialogue
- **Reaction Barks** — Responses to player actions
- **Companion Barks** — Party member interactions

### Cinematic Scripts

Full scripts for cutscenes including:

- Dialogue with performance direction
- Camera direction notes
- Action descriptions
- Timing guidance
- Transition instructions

---

## World Content

### Codex/Lore Entries

In-game readable content:

- **Entry ID and Category** — For database organization
- **In-World Attribution** — Who "wrote" this document
- **Content** — The actual lore text
- **Unlock Conditions** — When player discovers this
- **Related Entries** — Cross-references

### Environmental Text

- **Signs and Notices** — In-world signage
- **Documents** — Letters, journals, reports found in world
- **UI Text** — Menus, item descriptions, tutorials with personality
- **Loading Screens** — Tips and lore for loading moments

---

## Design Documents

### Quest Design Documents

| Section                   | Contents                           |
| ------------------------- | ---------------------------------- |
| **Overview**              | Quest name, type, estimated length |
| **Prerequisites**         | Required player state/progress     |
| **Narrative Summary**     | Story being told                   |
| **Objective Breakdown**   | Step-by-step player goals          |
| **Branch Documentation**  | Choice points and consequences     |
| **Rewards**               | XP, items, narrative outcomes      |
| **Characters Involved**   | Who appears, their roles           |
| **Locations**             | Where quest takes place            |
| **Dialogue Requirements** | Estimated line counts              |

### Narrative Design Documents

- **Feature Specs** — How narrative systems work (dialogue system, choice tracking)
- **Content Matrices** — Mapping content to game locations/characters
- **Voice Budget** — Line counts and recording estimates
- **Localization Notes** — Guidance for translation teams

---

## Production Assets

### Voice Recording Materials

| Document                | Purpose                          |
| ----------------------- | -------------------------------- |
| **Recording Script**    | Organized for studio sessions    |
| **Character Briefs**    | Quick reference for actors       |
| **Pronunciation Guide** | Made-up names/terms phonetically |
| **Context Document**    | Story summary for voice director |

### Localization Package

- **Master Text Export** — All strings with IDs
- **Context Notes** — Meaning/intent for translators
- **Character Limits** — UI constraints per string
- **Cultural Notes** — Content requiring localization attention

---

## Review Deliverables

### Narrative Review Documents

- **Story Walkthrough** — Prose summary for stakeholder review
- **Playthrough Script** — What happens in specific playthrough
- **Choice Consequence Map** — Visual of how choices affect outcomes
- **Tone/Content Flags** — Potentially sensitive content identified

### Quality Assurance Support

- **Narrative Test Cases** — Specific scenarios to verify
- **Consistency Checklist** — Continuity items to verify
- **Edge Case Documentation** — Unusual player paths to test

---

## Deliverable Format Standards

| Document Type          | Format                         | Version Control         |
| ---------------------- | ------------------------------ | ----------------------- |
| Story/Character Bibles | Google Docs/Confluence         | Major version numbering |
| Scripts                | Articy:draft/Excel/Proprietary | Per-line versioning     |
| Design Docs            | Confluence/Notion              | Wiki-style updates      |
| Lore Entries           | Game CMS/spreadsheet           | Content ID tracking     |
| Recording Materials    | PDF export                     | Session-dated           |

---

_All deliverables should be living documents, updated as the game evolves through development._
