/**
 * Battle States Enum
 * Defines all possible states in the battle system
 */
export enum BattleState {
  INTRO = 'INTRO',
  PRE_BATTLE_INFO = 'PRE_BATTLE_INFO',
  BRING_OUT_MONSTER = 'BRING_OUT_MONSTER',
  PLAYER_INPUT = 'PLAYER_INPUT',
  ENEMY_INPUT = 'ENEMY_INPUT',
  BATTLE = 'BATTLE',
  POST_ATTACK_CHECK = 'POST_ATTACK_CHECK',
  FINISHED = 'FINISHED',
  FLEE_ATTEMPT = 'FLEE_ATTEMPT',
  GAIN_EXPERIENCE = 'GAIN_EXPERIENCE',
  SWITCH_MONSTER = 'SWITCH_MONSTER',
  USED_ITEM = 'USED_ITEM',
  HEAL_ITEM_USED = 'HEAL_ITEM_USED',
  CAPTURE_ITEM_USED = 'CAPTURE_ITEM_USED',
  CAUGHT_MONSTER = 'CAUGHT_MONSTER',
}

export interface BattleStateConfig {
  onEnter?: () => void;
  onExit?: () => void;
  update?: () => void;
}

/**
 * Simple State Machine for Battle System
 * Manages battle flow and state transitions
 */
export class BattleStateMachine {
  private states: Map<BattleState, BattleStateConfig> = new Map();
  private currentState: BattleState | null = null;
  private previousState: BattleState | null = null;

  /**
   * Add a state to the machine
   */
  addState(state: BattleState, config: BattleStateConfig): void {
    this.states.set(state, config);
  }

  /**
   * Transition to a new state
   */
  setState(state: BattleState): void {
    if (this.currentState === state) {
      return;
    }

    // Exit current state
    if (this.currentState && this.states.has(this.currentState)) {
      const currentConfig = this.states.get(this.currentState)!;
      if (currentConfig.onExit) {
        currentConfig.onExit();
      }
    }

    this.previousState = this.currentState;
    this.currentState = state;

    // Enter new state
    if (this.states.has(state)) {
      const newConfig = this.states.get(state)!;
      if (newConfig.onEnter) {
        newConfig.onEnter();
      }
    }
  }

  /**
   * Update the current state
   */
  update(): void {
    if (this.currentState && this.states.has(this.currentState)) {
      const config = this.states.get(this.currentState)!;
      if (config.update) {
        config.update();
      }
    }
  }

  /**
   * Get the current state name
   */
  get currentStateName(): BattleState | null {
    return this.currentState;
  }

  /**
   * Get the previous state name
   */
  get getPreviousState(): BattleState | null {
    return this.previousState;
  }

  /**
   * Check if currently in a specific state
   */
  isInState(state: BattleState): boolean {
    return this.currentState === state;
  }

  /**
   * Reset the state machine
   */
  reset(): void {
    if (this.currentState && this.states.has(this.currentState)) {
      const currentConfig = this.states.get(this.currentState)!;
      if (currentConfig.onExit) {
        currentConfig.onExit();
      }
    }
    this.currentState = null;
    this.previousState = null;
  }
}