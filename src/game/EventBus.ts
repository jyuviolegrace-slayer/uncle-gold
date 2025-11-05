import { Events } from 'phaser';

/**
 * EventBus - Central event system for Critter Quest
 * Enables communication between Phaser scenes and React components
 * 
 * Save/Load Events:
 *   - game:saved { slot, timestamp }
 *   - game:loaded { slot, playerName }
 *   - game:saveFailed { slot, error }
 *   - game:loadFailed { slot, error }
 *   - game:deleted { slot }
 *   - autosave:success { slot }
 *   - autosave:failed { error }
 *   - storage:unavailable { message }
 * 
 * Battle Events:
 *   - battle:started, battle:ended, battle:victory, battle:defeat
 *   - battle:start { isWildEncounter }
 *   - battle:turn-complete { attacker, defender, damage }
 *   - battle:capture-attempt { critterId, success }
 *   - battle:level-up { critterId, newLevel }
 * 
 * Party/Inventory Events:
 *   - party:updated, party:full, inventory:updated, inventory:full
 *   - party:switch { fromIndex, toIndex }
 *   - inventory:use { itemId, targetId }
 * 
 * Progression Events:
 *   - badge:earned, pokedex:updated, money:updated, area:changed
 *   - level:up { critterId, newLevel }
 *   - evolution:start { critterId, speciesId }
 *   - evolution:complete { critterId, newSpeciesId }
 * 
 * Dialogue and Cutscene Events:
 *   - dialog:open { text, speaker, options }
 *   - dialog:close { choice }
 *   - dialog:choice { optionIndex }
 *   - cutscene:start { cutsceneId }
 *   - cutscene:end { cutsceneId }
 *   - cutscene:skip { cutsceneId }
 * 
 * Menu and UI Events:
 *   - menu:open { menuType }
 *   - menu:close { menuType }
 *   - menu:select { option }
 *   - options:changed { option, value }
 *   - hud:show { component }
 *   - hud:hide { component }
 * 
 * World Events:
 *   - area:changed { fromArea, toArea }
 *   - encounter:start { area, encounterType }
 *   - encounter:end { result }
 *   - npc:interact { npcId }
 *   - item:collected { itemId, quantity }
 *   - warp:start { destination }
 *   - warp:complete { destination }
 * 
 * Audio Events:
 *   - audio:play { key, type }
 *   - audio:stop { key }
 *   - audio:volume-changed { type, volume }
 *   - audio:mute-changed { isMuted }
 * 
 * Performance Events:
 *   - performance:updated { fps, frameTime, memoryUsage }
 *   - performance:warning { message }
 *   - toggle-debug
 * 
 * Notification Events:
 *   - notification:show { message, type, duration }
 *   - notification:hide { notificationId }
 *   - toast:show { message, type }
 *   - save:notification { type, message }
 */

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Events.EventEmitter();
