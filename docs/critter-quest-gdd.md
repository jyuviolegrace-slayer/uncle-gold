# Critter Quest - Game Design Document

**Status:** Approved for Implementation  
**Last Updated:** 2024  
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Vision](#core-vision)
3. [Game Overview](#game-overview)
4. [Critters & Progression](#critters--progression)
5. [Gameplay Systems](#gameplay-systems)
6. [World & Exploration](#world--exploration)
7. [Battle System](#battle-system)
8. [UI & Menus](#ui--menus)
9. [Save & Persistence](#save--persistence)
10. [Art & Audio Direction](#art--audio-direction)
11. [Development & Tech](#development--tech)

---

## Executive Summary

**Critter Quest** is a single-player, offline Pokémon-inspired browser RPG built with Phaser 3, TypeScript, and Next.js. Players explore a hand-crafted world, catch and train collectable creatures called "Critters," battle strategically against AI opponents, and ultimately challenge eight Gym Leaders to earn badges and defeat the Champion.

- **Target Audience:** Ages 8–35, casual to core gamers familiar with Pokémon or turn-based RPGs
- **Platform:** Web browser (desktop & mobile)
- **Play Time:** 5–15 hours for a full playthrough
- **Scope:** Offline, no multiplayer, no servers, no external APIs
- **MVP Content:** 25 base Critters, 5 evolution lines, 8 areas, 8 Gym Leaders, 1 Champion

---

## Core Vision

### Philosophy

Critter Quest captures the essence of classic monster-catching RPGs in a lightweight, fully offline browser experience. We focus on:

- **Exploration & Discovery:** Rewarding the player for exploring every corner of the world
- **Collection:** Building a diverse team and completing a digital Pokédex
- **Strategy:** Meaningful team composition, type advantages, and move selection
- **Progression:** Clear milestones (badges, levels, evolutions, rival battles)
- **Replayability:** Different starter choices, multiple team builds, hidden encounters

### Target Experience

- **New Player:** Receives a starter Critter and tutorial guidance, learns type matchups, catches first Critters, beats first Gym Leader within 30–60 minutes
- **Intermediate Player:** Experiments with team synergy, exploits type advantages, explores optional areas, levels up Critters strategically
- **Hardcore Player:** Optimizes IV/nature-like stats, finds all legendary Critters, defeats Champion with min/max teams, attempts challenge runs

---

## Game Overview

### Setting & Story

The **Critter Quest** world is a vibrant, hand-drawn archipelago of eight distinct regions, each with its own personality, culture, and Gym Leader. The player is a young Critter trainer who receives a starter Critter from a kindly Professor and embarks on a journey to:

1. **Catch & Train:** Build a team of up to 6 Critters
2. **Earn Badges:** Defeat all 8 Gym Leaders
3. **Become Champion:** Face the reigning Champion in a final showdown

**Tone:** Lighthearted, encouraging, with moments of mild drama and humor. No deaths or dark themes; defeated Critters are simply healed.

### Core Loop

```
Explore → Encounter Critter → Battle / Catch → Train → Gym Battle → Badge → Repeat
                                                         ↓
                                                   Champion Battle
```

### Success Condition

**Victory:** Defeat the Champion, completing the Pokédex (catching or defeating all available Critters is optional for victory but encouraged for 100% completion).

---

## Critters & Progression

### Critter Roster: 25 Base Species

All Critters have:
- Unique name, type(s), base stats, moves, evolution path
- Pokedex-like entry (species, height, weight, bio)
- Gendered sprites (male/female appearance variants optional for MVP)

#### Starter Trio (Always Available at Game Start)

| # | Name | Type | HP | ATK | DEF | SPD | SpA | SpD | Evolution | Notes |
|---|------|------|----|----|-----|----|-----|-----|-----------|-------|
| 1 | Embolt | Fire | 39 | 52 | 43 | 65 | 60 | 50 | → Boltiger (L36) | Energetic, speedy |
| 2 | Aqualis | Water | 44 | 48 | 65 | 43 | 50 | 64 | → Tidecrown (L36) | Calm, defensive |
| 3 | Thornwick | Grass | 45 | 49 | 49 | 45 | 65 | 49 | → Verdaxe (L36) | Nurturing, special attacker |

#### Early-Game Critters (Routes 1–3, Grass/Common)

| # | Name | Type | Evolution | Notes |
|---|------|------|-----------|-------|
| 4 | Sparkit | Electric | → Voltrix (L20) | Yellow mouse, early electric option |
| 5 | Rockpile | Rock | → Boulderan (L25) | Stubborn rock type |
| 6 | Pupskin | Normal | → Houndrake (L22) | Dog-like, loyal |
| 7 | Bugite | Bug | → Silkbeast (L18) | Early butterfly, fragile |

#### Mid-Game Critters (Routes 4–5, Varied Types)

| # | Name | Type | Evolution | Notes |
|---|------|------|-----------|-------|
| 8 | Frostwhip | Ice | → Glaciarch (L30) | Mischievous snow creature |
| 9 | Psychink | Psychic | → Mindseer (L32) | Alien-like telepath |
| 10 | Flamepaw | Fire | → Infernacom (L35) | Beast-like fire type |
| 11 | Mystwave | Water | → Leviathan (L38) | Serpentine water creature |
| 12 | Venomling | Poison | → Toxiclaw (L29) | Tiny toxic reptile |

#### Late-Game Critters (Routes 6–7, Rare/Themed)

| # | Name | Type | Evolution | Notes |
|---|------|------|-----------|-------|
| 13 | Stoneguard | Ground | → Terrasmith (L34) | Slow defensive type |
| 14 | Skyfeather | Flying | → Aerowing (L31) | Swift bird, fragile |
| 15 | Shadowmist | Dark | → Nightclaw (L37) | Spooky dark-type |
| 16 | Ironhide | Steel | → Mechacore (L40) | Metallic, resistant |
| 17 | Lightbringer | Fairy | → Radianceking (L39) | Magical sparkly type |

#### Elite & Legendary Critters (Champion Route, Secret Areas)

| # | Name | Type | Evolution | Notes |
|---|------|------|-----------|-------|
| 18 | Drakeling | Dragon | → Wyrmking (L45) | Rare dragon, late-game |
| 19 | Infernus | Fire/Dark | None | Legendary, one-of-a-kind |
| 20 | Tidal | Water/Electric | None | Legendary, one-of-a-kind |
| 21 | Natureveil | Grass/Fairy | None | Legendary, one-of-a-kind |

#### Hidden / Rare Critters

| # | Name | Type | Notes |
|---|------|------|-------|
| 22 | Chronus | Psychic/Steel | Ultra-rare time creature |
| 23 | Flamewing | Fire/Flying | Hidden in volcanic cave |
| 24 | Crystaleon | Ice/Fairy | Hidden in frozen lake |
| 25 | Voidshade | Dark/Psychic | Endgame hidden encounter |

### Evolution Lines Summary

5 main evolution lines covering 25 species:

1. **Embolt → Boltiger** (Fire/Electric)
2. **Aqualis → Tidecrown** (Water)
3. **Thornwick → Verdaxe** (Grass)
4. **Starter Secondary Line:** Selected starters have alternate evolutions at higher levels or special items (future expansion)
5. **Generic Progression:** 16 non-starter Critters follow 2-stage evolutions (base → evolved)

Additional legendary/mythical Critters (5 species) do not evolve.

### Stat System

Each Critter has **6 core stats**:

- **HP** — Hit Points (max health)
- **ATK** — Physical Attack power
- **DEF** — Physical Defense
- **SPD** — Speed (determines move order)
- **SpA** — Special Attack power
- **SpD** — Special Defense

**Stat Growth:**
- Base stats range from 20 to 95
- Level-up growth: `New Stat = Base Stat + (Level - 1) × Growth Rate`
- Growth rate varies per Critter (0.5–1.5 per level)
- Evolutions may boost stats by +10 to +30 overall

**Example:** Embolt (base ATK 52) levels to 20:
`ATK = 52 + (20 - 1) × 0.9 = 52 + 17 = 69 ATK`

### Leveling & Experience

- **Starting Level:** 5
- **Max Level:** 50
- **EXP Formula:** `EXP Needed = 4 × Level²` (quadratic scaling)
  - Level 10: 400 EXP
  - Level 25: 2,500 EXP
  - Level 50: 10,000 EXP
- **Battle EXP:** Defeated foe's level × type matchup bonus (1.0 to 2.0)

### Evolution Milestones

| Trigger | Details |
|---------|---------|
| **Level-Up** | Most Critters evolve at Level 18, 25, 30, 35, or 40 |
| **Special Item** | Future expansion; starter Critters may have alternate evolutions |
| **Legendary Critters** | Do not evolve; static level 30–50 |

---

## Gameplay Systems

### Catching Mechanics

**Encounter Flow:**
1. Player enters tall grass, water, or cave
2. Wild Critter appears (random or scripted)
3. Player can **Catch**, **Battle**, or **Flee**

**Catch Success Rate:**
```
Catch Rate (%) = Base Rate × (HP_Current / HP_Max) × Item Modifier
```

- **Base Rate:** Per species (30% to 100%); legendaries are 5–20%
- **HP Modifier:** Lower HP = higher catch rate (3% full health, 10% half health, 30% critical)
- **Item Modifiers:**
  - Basic Ball: 1.0×
  - Great Ball: 1.5×
  - Ultra Ball: 2.0×
  - Legendary Ball: 3.0× (rare, expensive)

**Outcome:**
- **Success:** Critter joins party or goes to PC (if party full)
- **Failure:** Ball breaks, Critter may flee or attack again

### Battle System

#### Turn-Based Combat

**Battle Flow:**
1. Determine turn order (SPD stat + move priority)
2. Active Critter uses move or switches out
3. Opponent responds
4. Apply damage, status, stat changes
5. Repeat until: one party faints, player flees, or player wins

#### Moves

Each move has:
- **Name & Type** (Fire, Water, Grass, Electric, Psychic, Normal, Ground, etc.)
- **Power** (Base Damage: 0–150)
- **Accuracy** (50–100%)
- **PP** (Power Points: uses per battle; 5–40 base)
- **Category:** Physical (uses ATK/DEF), Special (uses SpA/SpD), Status (no damage)
- **Effect:** Damage, stat changes, status conditions, healing, etc.

**Example Moves:**

| Name | Type | Power | Acc | PP | Category | Effect |
|------|------|-------|-----|----|-----------|---------
| Scratch | Normal | 40 | 100 | 35 | Physical | Deals damage |
| Flame Burst | Fire | 70 | 100 | 15 | Special | Deals damage; 10% burn |
| Aqua Ring | Water | — | 100 | 20 | Status | Heals 1/8 HP each turn for 5 turns |
| Thunderbolt | Electric | 90 | 100 | 15 | Special | Deals damage; 10% paralyze |
| Growth | Grass | — | — | 40 | Status | Raises SpA by 1 stage |
| Psychic | Psychic | 90 | 100 | 10 | Special | Deals damage; 10% lowers SpD |
| Dragon Claw | Dragon | 80 | 100 | 15 | Physical | Deals damage |

**Move Acquisition:**
- **Level-Up:** Critter learns new moves at specific levels (e.g., Embolt learns Charge at L8, Thunderbolt at L24)
- **Move Tutor:** NPCs teach moves for currency (TBD for MVP; can be added post-launch)
- **Starting Moves:** Each Critter begins with 1–3 moves

#### Damage Calculation

```
Damage = ((2 × Level / 5 + 2) × Power × Stat / 100) / 25 + 2) × STAB × Type × Random(0.85, 1.0)
```

Where:
- **Stat** = ATK (physical) or SpA (special)
- **STAB** = 1.5× if move type matches Critter type, else 1.0×
- **Type** = Type effectiveness multiplier (0.5×, 1.0×, 2.0×, etc.)
- **Random** = Damage variance (±15%)

#### Type Effectiveness

8 types with a 8×8 matchup matrix:

| Type | Strong Against | Weak To | Resists |
|------|---|---|---|
| **Fire** | Grass, Bug, Steel, Fairy | Water, Ground, Rock | Fire, Grass, Ice, Flying, Bug, Fairy |
| **Water** | Fire, Ground, Rock | Electric, Grass | Water, Ice, Steel |
| **Grass** | Water, Ground, Rock | Fire, Ice, Poison, Flying, Bug | Water, Ground, Grass |
| **Electric** | Water, Flying | Ground | Electric, Flying, Steel |
| **Psychic** | Poison, Fighting | Dark, Bug, Ghost | Psychic, Fighting |
| **Ground** | Fire, Electric, Poison, Rock, Steel | Water, Grass, Ice | Poison, Rock |
| **Dark** | Psychic, Ghost | Fighting, Bug, Fairy | Dark, Ghost |
| **Fairy** | Fighting, Dark, Dragon | Poison, Steel | Fighting, Bug, Dark |

**Effectiveness Matrix:**

|        | Fire | Water | Grass | Electric | Psychic | Ground | Dark | Fairy |
|--------|------|-------|-------|----------|---------|--------|------|-------|
| **Fire** | 0.5 | 0.5 | 2.0 | 1.0 | 1.0 | 1.0 | 1.0 | 2.0 |
| **Water** | 2.0 | 0.5 | 0.5 | 1.0 | 1.0 | 2.0 | 1.0 | 1.0 |
| **Grass** | 0.5 | 2.0 | 0.5 | 1.0 | 1.0 | 2.0 | 1.0 | 1.0 |
| **Electric** | 1.0 | 2.0 | 0.5 | 0.5 | 1.0 | 1.0 | 1.0 | 1.0 |
| **Psychic** | 1.0 | 1.0 | 1.0 | 1.0 | 0.5 | 1.0 | 2.0 | 1.0 |
| **Ground** | 2.0 | 1.0 | 0.5 | 2.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| **Dark** | 1.0 | 1.0 | 1.0 | 1.0 | 2.0 | 1.0 | 0.5 | 0.5 |
| **Fairy** | 0.5 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 2.0 | 1.0 |

**Interpretation:**
- **Row = Attacking Type, Column = Defending Type**
- **2.0 = Super Effective (+25% damage)**
- **1.0 = Neutral (normal damage)**
- **0.5 = Resisted (-25% damage)**

**Dual-Type Matchups:**
- Example: Fire/Dragon attacking Grass Critter = 2.0 (Fire) × 1.0 (Dragon) = 2.0
- Example: Fire/Dragon defending against Water Critter = 0.5 (Fire) × 1.0 (Dragon) = 0.5

#### Status Conditions

| Status | Effect | Removal |
|--------|--------|---------|
| **Burn** | 1/8 ATK reduction each turn; SPD reduced (if used) | Full restore, specific move, turn passage |
| **Poison** | 1/8 HP damage per turn | Full restore, specific move, switch out |
| **Paralyze** | 1/4 SPD reduction; 25% chance to skip turn | Full restore, specific move |
| **Sleep** | Cannot act; 1–3 turns before waking | Wake-up move, turn passage, switch |
| **Freeze** | Cannot act; 20% chance to thaw per turn | Fire-type move, switch, turn passage |
| **Confusion** | 25% chance to damage self (1/4 damage) per turn; lasts 1–4 turns | Specific move, switch, turn passage |

#### AI Opponent Behavior

**Gym Leaders & Champion:**
1. **Team Composition:** Themed around their specialization (e.g., Fire-type Gym Leader uses all Fire Critters)
2. **Switch Logic:** Switches when facing type disadvantage or after fainting
3. **Move Selection:** Chooses moves based on:
   - Type advantage (prioritize super-effective)
   - Opponent HP (use healing if <30%, use damage if opponent <20%)
   - Strategic status (use paralyze/burn if opponent is offensive)
   - Backup moves (random if no tactical choice)
4. **Difficulty Scaling:** Later Gym Leaders use higher-level Critters, better moves, more held items

**Wild Critter AI:**
- Simple: Always attack with highest-power move
- May flee if HP is low

### Catching Training & Growth

**Leveling Progression:**
- Critter gains 1 level per battle victory
- Bonus EXP for type advantage (2× if super-effective)
- Shared EXP if multiple Critters in party

**Training:**
- **Optimal Path:** Battle Gym Leaders and rivals; each grants 500–2,000 EXP
- **Alternative Path:** Grind wild Critters in specific areas
- **Balanced Approach:** Mix both for steady, entertaining progression

**Growth Curve:**
- **Early (L5–15):** ~2 hours gameplay; reach first Gym Leader
- **Mid (L15–35):** ~3–5 hours gameplay; face Gyms 2–6
- **Late (L35–50):** ~2–3 hours gameplay; compete against final Gym Leaders & Champion

---

## World & Exploration

### Eight Areas / Routes

#### Area 1: Meadowvale (Starter Area)

- **Theme:** Lush grassland, farms, peaceful villages
- **Critters:** Embolt, Aqualis, Thornwick, Sparkit, Rockpile, Pupskin
- **Gym Leader:** **Bella** (Grass type)
  - Team: Thornwick (L12), Grass Critter B (L12), Plant-type wild (L13)
  - Badge: Sprout Badge (increases Critter friendship)
- **NPCs:** Professor Sage (starter giver), Nurse Joy (healer), rival trainer Blake
- **Landmarks:** Starting town (home), Pokémon Center, Mart, Grass Gym, Route through meadows

#### Area 2: Crimson Canyon (Fire-themed)

- **Theme:** Desert, volcanoes, rocky terrain, hot springs
- **Critters:** Flamepaw, Frostwhip (rare), Sparkbit (new), Rock-types
- **Gym Leader:** **Ignacio** (Fire type)
  - Team: Flamepaw (L16), Infernacom (L17), Fire-type ally (L16)
  - Badge: Inferno Badge (boosts Fire moves by 10%)
- **Landmarks:** Volcano dungeon, hot springs (healing spot), Fire Gym
- **Challenge:** Navigate lava puzzles; catch Frostwhip as rare ice counter

#### Area 3: Sapphire Coast (Water-themed)

- **Theme:** Beach, cliffs, underwater cave (visual/story only)
- **Critters:** Aqualis evolutions, Mystwave, Water-types, Skyfeather
- **Gym Leader:** **Marina** (Water type)
  - Team: Tidecrown (L20), Mystwave (L20), Leviathan (L21)
  - Badge: Cascade Badge (allows use of Surf outside battle)
- **Landmarks:** Tropical beach, surfer hangout, Water Gym, lighthouse, secret beach cave
- **Collectible:** Rare water stones for evolution

#### Area 4: Thunderpeak (Electric-themed)

- **Theme:** Urban city, power plant, stormy weather
- **Critters:** Sparkit, Voltrix, Electric Critters, Psychink
- **Gym Leader:** **Surge** (Electric type)
  - Team: Voltrix (L24), Thunderbolt critter (L25), Electric-ally (L24)
  - Badge: Bolt Badge (increases SPD in battle by 1 stage)
- **Landmarks:** Tech city, power plant dungeon (puzzle), Electric Gym
- **Puzzle:** Navigate electrical hazards; solve circuit-like puzzles

#### Area 5: Frosted Peak (Ice-themed)

- **Theme:** Snow mountain, frozen lake, ice palace
- **Critters:** Frostwhip, Glaciarch, Ice-types, Crystalleon (hidden)
- **Gym Leader:** **Elise** (Ice type)
  - Team: Glaciarch (L28), Icy critter (L28), Frozen ally (L29)
  - Badge: Freeze Badge (resists ice damage by 25%)
- **Landmarks:** Snowy peaks, frozen lake, Ice Gym, hidden ice palace (legend)
- **Collectible:** Glacial stones, rare frozen Critters

#### Area 6: Shadewood Forest (Dark/Ghost-themed)

- **Theme:** Dense forest, abandoned mansion, graveyard aura
- **Critters:** Shadowmist, Nightclaw, Dark-types, Ghost-themed Critters, Voidshade (hidden)
- **Gym Leader:** **Sable** (Dark type)
  - Team: Nightclaw (L32), Shadow-ally (L32), Dark Critter (L33)
  - Badge: Shadow Badge (raises Dark-type moves by 10%)
- **Landmarks:** Spooky forest maze, abandoned mansion (exploration), Dark Gym, hidden shrine
- **Atmosphere:** Eerie, mysterious; some story revelations

#### Area 7: Celestial Sanctum (Psychic-themed)

- **Theme:** Ancient temple, floating islands, mystical atmosphere
- **Critters:** Psychink, Mindseer, Psychic-types, Chronus (ultra-rare)
- **Gym Leader:** **Mentor** (Psychic type)
  - Team: Mindseer (L36), Psychic-ally (L36), Teleporting critter (L37)
  - Badge: Mind Badge (raises Psychic moves by 10%)
- **Landmarks:** Ancient temple ruins, floating gardens, Psychic Gym, meditation chambers
- **Mechanic:** Some areas require specific Critter moves to access (e.g., Teleport, Psychic barrier)

#### Area 8: Dragon's Peak (Dragon/Multi-type)

- **Theme:** Mountain pinnacle, dragon lair, final challenge aesthetic
- **Critters:** Drakeling, Wyrmking, Dragon-types, Infernus, Tidal, Natureveil (legendaries)
- **Gym Leader:** **Drake** (Dragon type)
  - Team: Wyrmking (L40), Dragon-ally (L40), Drakeling (L39)
  - Badge: Dragon Badge (raises Dragon-type damage by 15%)
- **Landmarks:** Dragon's Peak Gym, Dragon lair (story location), secret shrines
- **Champion Battle:** After earning all 8 badges, player ascends Dragon's Peak to face **Champion Aria**
  - Champion Team (L42–45): Wyrmking, Infernus, Radianceking, Tidal, Natureveil, a user-favorite sweeper

### Encounter Pacing

| Level | Area | Wild Critters | Trainer Battles |
|-------|------|---|---|
| 5–8 | Meadowvale | Lv3–6 | Rival battle (optional), Bug Catcher (Lv4) |
| 8–12 | Routes 1–2 | Lv5–10 | Youngster (Lv8), Lass (Lv9) |
| 12–16 | Crimson Canyon | Lv10–14 | Hiker (Lv13), Gym Leader Ignacio (Lv16) |
| 16–20 | Sapphire Coast | Lv14–18 | Fisherman (Lv16), Surfer (Lv18), Gym Leader Marina (Lv20) |
| 20–24 | Thunderpeak | Lv18–22 | Tech Worker (Lv19), Gym Leader Surge (Lv24) |
| 24–28 | Frosted Peak | Lv22–26 | Skier (Lv24), Gym Leader Elise (Lv28) |
| 28–34 | Shadewood Forest | Lv26–32 | Bug Catcher (Lv29), Gym Leader Sable (Lv32) |
| 34–40 | Celestial Sanctum | Lv30–38 | Mystic (Lv35), Gym Leader Mentor (Lv36) |
| 40–50 | Dragon's Peak | Lv38–45 | Rival Final (Lv40), Gym Leader Drake (Lv40), Champion Aria (Lv45) |

### Map Layout

- **Nonlinear but Gated:** Player can visit areas in any order (after opening), but badges gate certain passages (HM-like moves)
- **Shortcuts & Secrets:** Hidden caves, item caches, rare Critter spawns reward thorough exploration
- **Day/Night Cycle:** Optional; affects which Critters appear (e.g., Shadowmist night-only, Daylight Critters day-only)

---

## Battle System

### Pre-Battle Setup

**Battle Initiation:**
- Trainer battle (Gym, Rival, Champion): Scene transition, dramatic music, opponent intro
- Wild encounter: Grass rustles, Critter appears with default music
- Trainer Battles: AI trainer has 3–6 Critters

**Party Selection (if applicable):**
- Player selects which Critter to send out first (or defaults to first active)
- Some boss fights may have specific restrictions (e.g., "Use only one Critter")

### During Battle

**Each Turn:**
1. **Input Phase:** Player selects action (Attack, Switch, Item, Run)
   - **Attack:** Choose move or auto-select strongest
   - **Switch:** Select new active Critter from party
   - **Item:** Use Potion, Antidote, or Pokéball
   - **Run:** Flee wild battle (50% success; based on SPD)
2. **Priority Calculation:** Moves with priority (0, +1, -1) determine order; else SPD stat decides
3. **Execution Phase:** Attacker uses move; defender takes damage or applies status; effects resolve
4. **Post-Turn:** Check for fainting; if fainting, allow switch or send new Critter

**End Conditions:**
- Player wins: All opponent Critters fainted or opponent flees
- Player loses: All player Critters fainted (blackout; wake at last Pokémon Center)
- Player flees: Successful escape (wild battles only; 50%+ success)

---

## UI & Menus

### Main Menu (Launch Screen)

- **Title Card:** "Critter Quest" logo, background animation (parallax scrolling scenery)
- **Options:**
  - [NEW GAME] — Start fresh
  - [CONTINUE] — Load last save
  - [SETTINGS] — Audio, language, difficulty (optional MVP)
  - [CREDITS] — Dev team, music attribution
  - [EXIT] — Close game

### Overworld HUD

**Top-Left Corner (Player Info):**
- Trainer name, money ($), playtime

**Bottom-Right Corner (Quick Access):**
- Mini icon for current team (6 Critter portraits with HP bars, visible or 1–2 at a time)

**Button-Triggered Menus:**
- **M key / Menu Button:** Opens main menu
  - Pokédex (catch/battle count)
  - Team / Party Management
  - Inventory / Bag
  - Trainer Card (badges, win/loss record)
  - Settings
  - Save / Load

### Battle Screen

**Layout:**
- **Top:** Opponent Critter (sprite, name, level, HP bar)
- **Bottom:** Player Critter (sprite, name, level, HP bar)
- **Right Side:** Player's active Critter details (current HP, status)
- **Bottom-Center:** Action menu
  - [ATTACK] → Move selection sub-menu
  - [SWITCH] → Party sub-menu (fainted grayed out)
  - [ITEM] → Bag sub-menu (consumables)
  - [RUN] → Flee attempt (wild only)

**Visual Feedback:**
- Damage numbers pop-up (red for damage, green for healing)
- Status icons (burn, poison, paralyze, sleep, freeze, confusion)
- Type effectiveness indicator (color flash: red = weak to, blue = resists)
- Floating text for stat changes ("+1 ATK!", "SPD fell!")

### Pokédex (Species Tracker)

- **Grid View:** All 25 Critters displayed as icons
- **Caught State:** Color (owned), grayscale (seen), unknown (?)
- **Individual Entry:** Taps a Critter to view full Pokédex entry
  - Sprite, name, type(s), height, weight
  - Classification (e.g., "Fire Mouse Critter")
  - Bio (1–2 sentences)
  - Stats (bars)
  - Type effectiveness (visual chart)
- **Completion %:** Displays progress (0/25 → 25/25)

### Party Management Screen

- **Left Panel:** 6 party slots (show Critter portrait, level, HP/Max HP, status)
- **Right Panel:** Detailed view of selected Critter
  - Name, type(s), level, experience to next level
  - Stats breakdown (HP, ATK, DEF, SPD, SpA, SpD)
  - Moves (name, power, accuracy, PP current/max)
  - Held item (if any)
- **Interactions:**
  - [SWITCH] positions in party
  - [RELEASE] permanently deletes Critter (confirmation dialog)
  - [DETAILS] shows full Pokédex entry

### Shop Interface

**In-Town Shops:**
- **Pokémon Mart:** Potions, Antidotes, Status Heals, Pokéballs
- **Move Tutor NPC:** Purchase move resets or special tutors (future)

**Shop Menu:**
- **Left:** Item list (name, price, description, quantity held)
- **Right:** Item detail & purchase amount
- **Bottom:** Total cost, confirm purchase, cancel

**Inventory / Bag Screen:**
- **Tabs:** Items, Key Items, Pokéballs, Medicine
- **List:** Quantity, name, description
- **Actions:** Use (on party), Discard, Sort

### Save & Load Screen

- **Quick Save Slot:** Auto-save on entering new area or after major event
- **Manual Save Slots:** Player can save/load at any time (or at Pokémon Centers only—design choice)
- **Save Data Displayed:**
  - Player name, playtime, badges earned, money, last location
- **Confirmation:** "Save game?" with [YES/NO]

### Settings Menu

- **Audio Sliders:** Master, BGM, SFX, Voice volumes
- **Display:** Brightness, text speed (slow/normal/fast)
- **Language:** English (primary MVP), others (post-launch)
- **Accessibility:** Text size, colorblind mode, motion toggle

---

## Save & Persistence

### Save File Structure

**JSON Format (localStorage):**

```json
{
  "player": {
    "name": "Ash",
    "money": 5000,
    "playTime": 3600,
    "badgesEarned": ["Sprout", "Inferno", "Cascade"],
    "rivalDefeats": 2,
    "lastLocation": "CrimsonCanyon"
  },
  "party": [
    {
      "id": 1,
      "species": "Embolt",
      "level": 18,
      "currentHP": 45,
      "maxHP": 52,
      "exp": 1500,
      "status": "none",
      "moves": ["Charge", "Scratch", "Flame Burst"],
      "item": null
    },
    { ... }
  ],
  "pokedex": {
    "1": { "caught": true, "seen": true },
    "2": { "caught": false, "seen": true },
    "3": { "caught": true, "seen": true },
    ...
  },
  "inventory": {
    "potions": 5,
    "antidotes": 2,
    "pokeballs": 10,
    "greatballs": 3
  },
  "areaProgression": {
    "MeadowvaleGym": true,
    "CrimsonCanyonGym": true,
    ...
  },
  "settings": {
    "audioVolume": 0.8,
    "textSpeed": "normal",
    "language": "en"
  }
}
```

### Auto-Save Triggers

- After entering a new area
- After Gym battle (win/lose)
- After catching a Critter
- After leveling up a Critter
- Before entering Champion battle
- Every 5 minutes (optional)

### Data Persistence

- **Storage Engine:** Browser localStorage (IndexedDB for MVP if file size requires)
- **Backup:** Player can export save file as JSON (future feature)
- **Cloud Sync:** None (fully offline; sync disabled)

---

## Art & Audio Direction

### Visual Style

- **Aesthetic:** Pixel art or 2D illustrated sprites (charming, not hyper-realistic)
- **Resolution:** Designed for 1280×720 base, scales responsive for mobile
- **Sprite Sizes:**
  - Overworld Critter sprites: 64×64 px
  - Battle sprites: 128×128 px (larger, dramatic)
  - UI icons: 32×32 px (small portraits), 64×64 px (detailed)
- **Tile Size:** 32×32 px for map tiles, consistent with Phaser best practices
- **Color Palette:** Vibrant but not overwhelming; each area has dominant color theme (greens for Meadowvale, reds for Crimson Canyon, etc.)

### Animation

- **Critter Idle:** Subtle bobbing, breathing motion (2–3 frames, loop)
- **Attack Animation:** Slide forward, impact effect, slide back (3–4 frames)
- **Hit Effect:** Color flash (red on hit), knockback or recoil
- **Evolution:** Spin, grow, light burst, reveal new sprite (2–3 second sequence)
- **UI Transitions:** Fade in/out for menus, slide-in for party panels, smooth scrolls

### Audio Direction

**Music:**
- **Main Theme:** Uplifting, adventurous (60–90 BPM)
- **Battle Theme:** Energetic, rhythmic (120–140 BPM)
- **Gym Leader Theme:** Intense, dramatic variation of battle theme
- **Champion Theme:** Epic, climactic orchestral
- **Area Themes:** 8 distinct, region-appropriate tracks (desert, ocean, mountain, etc.)
- **Menu Theme:** Calm, contemplative
- **Victory Fanfare:** Short, celebratory jingle
- **Format:** MP3 or WebM (optimized for browser)

**Sound Effects:**
- **Move Sounds:** Type-specific effects (fire crackle, water splash, etc.)
- **Hit/Miss:** Confirm beep for hit, low tone for miss
- **UI Interactions:** Soft click/beep for menu navigation, success chime for catch
- **Status Effects:** Distinct tones for burn, poison, paralysis (brief, non-intrusive)
- **Level Up:** Rising chime with gentle "ding" finale
- **Pokédex Entry:** Soft scan/register sound

**Voice (Optional MVP):**
- Critter cries (synthesized squeaks, roars, or tones; no speech)
- No full voice acting for MVP; dialogue is text-based

---

## Development & Tech

### Technology Stack

- **Engine:** Phaser 3.90
- **Framework:** Next.js 15 (React 19)
- **Language:** TypeScript 5
- **State Management:** React hooks + EventBus (Phaser ↔ React communication)
- **Styling:** Global CSS (future: Tailwind or styled-components)
- **Storage:** localStorage (JSON) or IndexedDB
- **Build Tool:** Next.js built-in (Webpack)
- **Target Browsers:** Chrome, Firefox, Safari (desktop & mobile), Edge

### Code Architecture

#### Scenes

1. **Boot** — Initialize game, load critical assets
2. **Preloader** — Load all sprites, sounds, maps
3. **MainMenu** — Title screen, save selection, settings
4. **Overworld** — Exploration, NPCs, wild battles, area transitions
5. **BattleScene** — Gym/Trainer/Wild battles, AI logic
6. **GameOver** — Victory screen, Champion defeat, restart options

#### Data Models (TypeScript Interfaces)

```typescript
// Critter definition
interface Critter {
  id: number;
  name: string;
  type: [Type, Type?]; // Primary & optional secondary type
  baseStats: Stats;
  moves: Move[];
  evolutionLine: EvolutionStage[];
}

// Battle instance
interface BattleState {
  playerParty: CritterInstance[];
  opponentParty: CritterInstance[];
  currentPlayerCritter: CritterInstance;
  currentOpponentCritter: CritterInstance;
  turnCount: number;
  playerFainted: boolean;
  opponentFainted: boolean;
}

// Player save data
interface SaveData {
  player: PlayerProfile;
  party: CritterInstance[];
  pokedex: PokedexEntry[];
  inventory: Inventory;
  areaProgression: AreaStatus;
}
```

#### Key Systems

- **CritterManager:** Instantiate, level up, catch, evolve Critters
- **BattleEngine:** Damage calc, type matchup, status effects, AI decisions
- **EncounterSystem:** Wild Critter spawning, rarity weights, level ranges
- **SaveManager:** Serialize/deserialize save data to localStorage
- **UIController:** Menu state, transitions, data binding

### Asset Organization

```
public/assets/
  ├── sprites/
  │   ├── critters/ (25 + evolutions × male/female variants)
  │   ├── ui/ (buttons, icons, borders)
  │   ├── overworld/ (tileset, NPCs, environment)
  │   └── effects/ (attack animations, particles, transitions)
  ├── audio/
  │   ├── bgm/ (main theme, battle, gym, etc.)
  │   └── sfx/ (moves, ui, status, level up)
  ├── maps/
  │   └── *.json (Tiled exports for 8 areas)
  └── data/
      ├── critters.json (species definitions)
      ├── moves.json (move database)
      ├── trainers.json (Gym Leaders, Champion)
      └── encounters.json (wild spawn rates)
```

### MVP Development Phases

**Phase 1: Core Systems (Week 1–2)**
- Critter data models, stat system
- Battle engine (damage calc, type matchup, status)
- Move system, PP, accuracy
- Basic AI (random moves → smart type choice)

**Phase 2: Overworld & Progression (Week 2–3)**
- Overworld scene, collision, NPC system
- Encounter system (wild Critter spawning)
- Catching mechanics & Pokédex
- Party management

**Phase 3: Gym Leaders & Narrative (Week 3–4)**
- Design 8 Gym Leader teams
- Scripted trainer battles
- Badge progression, rival battles
- Story beats (starter gift, first badge, champion ascension)

**Phase 4: UI & Polish (Week 4–5)**
- All menus (party, Pokédex, inventory, settings)
- Save/load system
- Animations (battle, evolution, level up)
- Sound & music integration

**Phase 5: Testing & Launch (Week 5–6)**
- Balance testing (opponent difficulty, Critter stats)
- Bug fixes, performance optimization
- Accessibility review
- Soft launch, gather feedback

### Performance Targets

- **FPS:** Maintain 60 FPS on mid-range devices (2020+ mobile, modern desktop)
- **Load Time:** Initial page load <3s; area transitions <0.5s
- **File Size:** ~5–10 MB (after compression; including assets)
- **Memory:** <200 MB heap usage (browser constraints)

### Future Expansions (Post-MVP)

1. **Multiplayer:** PvP battles via WebSocket
2. **Expanded Critter Roster:** 50+ species, regional variants
3. **More Areas:** 12+ regions, expanded story
4. **Move Tutors & Items:** Hold items (Leftovers, Focus Band), nature/IV system
5. **Daily Events:** Limited-time Critter encounters, seasonal quests
6. **Graphical Upgrades:** Animated sprites, 3D overworld (optional)
7. **Modding Support:** User-created Critters, custom teams

---

## Acceptance Criteria

✅ **Completeness Checklist:**

- [ ] GDD documents all core mechanics (exploration, battles, catching, training, evolution, AI)
- [ ] 25 base Critters defined with 5 evolution lines, stat examples, and sample bios
- [ ] 8-element type system with full effectiveness matrix provided
- [ ] 8 areas (routes) detailed with Gym Leaders, encounter pacing, and map concept
- [ ] Stat system (HP/ATK/DEF/SPD/SpA/SpD) and move system (categories, PP, accuracy) specified
- [ ] Leveling & evolution milestones outlined (Level-up, items, legendary statics)
- [ ] Battle system explained (turn order, damage calc, type matchups, status conditions, AI behavior)
- [ ] UI/UX mockup provided for menus, shops, party, Pokédex, save/load
- [ ] Save persistence strategy (localStorage, JSON structure, auto-save triggers)
- [ ] Overworld layout (nonlinear, gated, shortcuts, day/night optional)
- [ ] Art direction (pixel art, sprite sizes, animation cues, color palettes)
- [ ] Audio direction (music, SFX, voice considerations)
- [ ] Tech stack confirmed (Phaser 3, Next.js, TypeScript, localStorage)
- [ ] Development phases outlined (5–6 weeks, MVP scope)
- [ ] Target audience identified (ages 8–35, casual to core)
- [ ] Play time estimate provided (5–15 hours full playthrough)
- [ ] Offline scope confirmed (no multiplayer, no servers, no APIs)
- [ ] GDD stored in `/docs/critter-quest-gdd.md` within repo

---

## Conclusion

**Critter Quest** is a focused, achievable passion project that brings the charm of classic monster-catching RPGs to the modern web. By leveraging Phaser 3's robust scene and physics systems, combined with Next.js's scalability, we create a fully offline, feature-rich experience that is both fun to play and maintainable for future expansion.

This GDD serves as the north star for development, ensuring all team members align on vision, scope, and quality targets. As implementation progresses, this document will be updated with finalized art references, balanced stat tables, and confirmed audio assets.

---

**Version History:**

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2024 | Initial comprehensive GDD; approved for implementation phase |

---

**Approvals:**

- [ ] Game Designer (Lead) — GDD Complete & Scope Finalized
- [ ] Technical Lead — Architecture & Feasibility Confirmed
- [ ] Project Manager — Timeline & Resources Allocated

---

*This GDD is a living document. As development progresses, sections will be refined with final asset references, detailed stat tables, move pools per Critter, and confirmed timelines.*
