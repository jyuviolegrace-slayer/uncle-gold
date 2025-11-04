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
 * 
 * Party/Inventory Events:
 *   - party:updated, party:full, inventory:updated, inventory:full
 * 
 * Progression Events:
 *   - badge:earned, pokedex:updated, money:updated, area:changed
 */

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Events.EventEmitter();
