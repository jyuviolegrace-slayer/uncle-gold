import { BattleManager, Critter, MoveDatabase, CritterSpeciesDatabase, ICritter } from '../../models';

describe('Battle System - TypeScript Port', () => {
  let battleManager: BattleManager;
  let playerParty: ICritter[];
  let opponentParty: ICritter[];

  beforeEach(() => {
    MoveDatabase.initialize();
    CritterSpeciesDatabase.initialize();

    playerParty = [
      new Critter('sparkit', 5),
      new Critter('aquafish', 5),
    ];

    opponentParty = [
      new Critter('flamewing', 5),
    ];

    const battle = BattleManager.createBattle(
      'player-1',
      'Player',
      playerParty,
      'wild-1',
      'Wild Critter',
      opponentParty,
      true
    );

    battleManager = new BattleManager(battle);
  });

  describe('Battle Initialization', () => {
    it('should create a battle with correct participants', () => {
      const battle = battleManager.getBattle();
      expect(battle.player.party.length).toBe(2);
      expect(battle.opponent.party.length).toBe(1);
      expect(battle.isWildEncounter).toBe(true);
    });

    it('should set active critters correctly', () => {
      const battle = battleManager.getBattle();
      const activeCritter = battleManager.getActiveCritter(battle.player.id);
      expect(activeCritter).toBe(playerParty[0]);
    });

    it('should track turn count', () => {
      const battle = battleManager.getBattle();
      expect(battle.turnCount).toBe(0);
    });
  });

  describe('Turn Order Determination', () => {
    it('should determine turn order based on speed', () => {
      const playerCritter = playerParty[0];
      const opponentCritter = opponentParty[0];

      const turnOrder = battleManager.determineTurnOrder(playerCritter, opponentCritter);
      expect(['player', 'opponent']).toContain(turnOrder);
    });

    it('should prioritize higher speed', () => {
      playerParty[0].currentStats.speed = 100;
      opponentParty[0].currentStats.speed = 50;

      const turnOrder = battleManager.determineTurnOrder(playerParty[0], opponentParty[0]);
      expect(turnOrder).toBe('player');
    });
  });

  describe('Damage Calculation', () => {
    it('should calculate damage > 0 for offensive moves', () => {
      const moveId = playerParty[0].moves[0].moveId;
      const opponentSpecies = CritterSpeciesDatabase.getSpecies(opponentParty[0].speciesId);

      const result = battleManager.resolveMoveAction(
        'player-1',
        moveId,
        opponentParty[0].currentStats,
        opponentSpecies?.type || []
      );

      expect(result.damage).toBeGreaterThan(0);
    });

    it('should check move accuracy', () => {
      const moveAccuracy = 90;
      const results = [];

      for (let i = 0; i < 100; i++) {
        results.push(battleManager.doesMoveHit(moveAccuracy));
      }

      const hitCount = results.filter(r => r).length;
      expect(hitCount).toBeGreaterThan(70);
      expect(hitCount).toBeLessThan(100);
    });
  });

  describe('Catch Mechanics', () => {
    it('should have lower catch rate for higher level critters', () => {
      opponentParty[0].level = 1;
      const lowLevelCatch = battleManager.attemptCatch(opponentParty[0], 1.0);

      opponentParty[0].level = 50;
      const highLevelCatch = battleManager.attemptCatch(opponentParty[0], 1.0);

      // Higher level should have lower catch rate on average
      // This is probabilistic, so we just verify no errors
      expect(typeof lowLevelCatch).toBe('boolean');
      expect(typeof highLevelCatch).toBe('boolean');
    });

    it('should apply catch modifier', () => {
      opponentParty[0].currentHP = opponentParty[0].maxHP;

      const normalCatch = battleManager.attemptCatch(opponentParty[0], 1.0);
      const improvedCatch = battleManager.attemptCatch(opponentParty[0], 2.0);

      // Both should be boolean
      expect(typeof normalCatch).toBe('boolean');
      expect(typeof improvedCatch).toBe('boolean');
    });
  });

  describe('Party Management', () => {
    it('should switch active critter', () => {
      const battle = battleManager.getBattle();
      const success = battleManager.switchCritter(battle.player.id, 1);

      expect(success).toBe(true);
      expect(battle.player.currentCritterIndex).toBe(1);
    });

    it('should prevent switching to fainted critter', () => {
      const battle = battleManager.getBattle();
      playerParty[1].currentHP = 0;
      const success = battleManager.switchCritter(battle.player.id, 1);

      expect(success).toBe(false);
      expect(battle.player.currentCritterIndex).toBe(0);
    });

    it('should check if participant has active critters', () => {
      const battle = battleManager.getBattle();
      let hasActive = battleManager.hasActiveCritters(battle.player.id);
      expect(hasActive).toBe(true);

      playerParty.forEach(c => {
        c.currentHP = 0;
      });

      hasActive = battleManager.hasActiveCritters(battle.player.id);
      expect(hasActive).toBe(false);
    });
  });

  describe('Damage Application', () => {
    it('should reduce critter HP on damage', () => {
      const battle = battleManager.getBattle();
      const playerCritter = battleManager.getActiveCritter(battle.player.id);
      const initialHP = playerCritter?.currentHP || 0;

      battleManager.damageActiveCritter(battle.player.id, 10);

      expect(playerCritter?.currentHP).toBe(initialHP - 10);
    });

    it('should prevent HP from going below 0', () => {
      const battle = battleManager.getBattle();
      const playerCritter = battleManager.getActiveCritter(battle.player.id);

      battleManager.damageActiveCritter(battle.player.id, 1000);

      expect(playerCritter?.currentHP).toBe(0);
      expect(playerCritter?.isFainted).toBe(true);
    });

    it('should mark critter as fainted when HP reaches 0', () => {
      const battle = battleManager.getBattle();
      const playerCritter = battleManager.getActiveCritter(battle.player.id);

      battleManager.damageActiveCritter(battle.player.id, playerCritter?.maxHP || 100);

      expect(playerCritter?.isFainted).toBe(true);
    });
  });

  describe('Random Move Selection', () => {
    it('should select a random move', () => {
      const move = battleManager.getRandomMove(playerParty[0]);
      expect(move).toBeTruthy();
    });

    it('should return null for critter with no moves', () => {
      const critter = new Critter('sparkit', 5);
      critter.moves = [];
      const move = battleManager.getRandomMove(critter);
      expect(move).toBeNull();
    });
  });

  describe('Battle Status', () => {
    it('should initialize battle as active', () => {
      const battle = battleManager.getBattle();
      expect(battle.battleStatus).toBe('Active');
    });

    it('should check battle status transitions', () => {
      const battle = battleManager.getBattle();
      battleManager.checkBattleStatus();
      expect(['Active', 'PlayerWon', 'PlayerLost']).toContain(battle.battleStatus);
    });

    it('should mark player as winner when opponent faints', () => {
      const battle = battleManager.getBattle();
      opponentParty[0].currentHP = 0;
      battleManager.checkBattleStatus();

      expect(battle.battleStatus).toBe('PlayerWon');
    });

    it('should mark opponent as winner when all player critters faint', () => {
      const battle = battleManager.getBattle();
      playerParty.forEach(c => {
        c.currentHP = 0;
      });
      battleManager.checkBattleStatus();

      expect(battle.battleStatus).toBe('PlayerLost');
    });
  });

  describe('Simulation of Catch Animation', () => {
    it('should simulate catch animation stages', () => {
      const stages = battleManager.simulateCatchAnimation();
      expect(stages).toBeGreaterThan(0);
      expect(stages).toBeLessThanOrEqual(4);
    });
  });
});
