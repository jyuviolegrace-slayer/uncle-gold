import { EventBus } from '../EventBus';

export type BattleStateType =
  | 'intro'
  | 'preBattleInfo'
  | 'bringOutCritter'
  | 'playerInput'
  | 'enemyInput'
  | 'battle'
  | 'postAttackCheck'
  | 'finished'
  | 'fleeing'
  | 'gainExperience'
  | 'switchCritter'
  | 'usedItem'
  | 'healItemUsed'
  | 'captureItemUsed'
  | 'caughtCritter';

/**
 * Callback type for state handlers
 */
type StateHandler = () => void | Promise<void>;

/**
 * BattleStateMachine - Manages battle flow through state transitions
 * Replaces legacy state machine logic with TypeScript implementation
 */
export class BattleStateMachine {
  private currentState: BattleStateType = 'intro';
  private stateHandlers: Map<BattleStateType, StateHandler> = new Map();
  private isTransitioning: boolean = false;

  constructor() {
    this.setupDefaultHandlers();
  }

  /**
   * Setup default state handlers
   */
  private setupDefaultHandlers(): void {
    const states: BattleStateType[] = [
      'intro',
      'preBattleInfo',
      'bringOutCritter',
      'playerInput',
      'enemyInput',
      'battle',
      'postAttackCheck',
      'finished',
      'fleeing',
      'gainExperience',
      'switchCritter',
      'usedItem',
      'healItemUsed',
      'captureItemUsed',
      'caughtCritter',
    ];

    states.forEach(state => {
      this.registerHandler(state, () => {
        EventBus.emit(`battle:state:${state}`);
      });
    });
  }

  /**
   * Register a handler for a state
   */
  registerHandler(state: BattleStateType, handler: StateHandler): void {
    this.stateHandlers.set(state, handler);
  }

  /**
   * Transition to a new state
   */
  async transitionTo(newState: BattleStateType): Promise<void> {
    if (this.isTransitioning) {
      return;
    }

    if (newState === this.currentState) {
      return;
    }

    this.isTransitioning = true;

    try {
      EventBus.emit('battle:state:exiting', { from: this.currentState });

      const handler = this.stateHandlers.get(newState);
      if (handler) {
        await handler();
      }

      this.currentState = newState;
      EventBus.emit('battle:state:entered', { state: newState });
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Get current state
   */
  getCurrentState(): BattleStateType {
    return this.currentState;
  }

  /**
   * Check if in a specific state
   */
  isInState(state: BattleStateType): boolean {
    return this.currentState === state;
  }

  /**
   * Check if transitioning
   */
  getIsTransitioning(): boolean {
    return this.isTransitioning;
  }

  /**
   * Reset state machine
   */
  reset(): void {
    this.currentState = 'intro';
    this.isTransitioning = false;
  }
}
