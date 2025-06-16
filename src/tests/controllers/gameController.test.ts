import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type GameControllerDependencies,
  createGameController,
} from '../../controllers/gameController.js';
import type { Pokemon } from '../../types/index.js';

describe('GameController', () => {
  let gameController: ReturnType<typeof createGameController>;
  let mockDependencies: GameControllerDependencies;

  const testPokemon: Pokemon[] = [
    {
      name: 'ピカチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 25,
      types: ['electric'],
      firstChar: 'ピ',
      lastChar: 'ウ',
    },
    {
      name: 'ウインディ',
      genus: 'でんせつポケモン',
      generation_id: 1,
      pokedex_number: 59,
      types: ['fire'],
      firstChar: 'ウ',
      lastChar: 'ィ',
    },
    {
      name: 'フシギダネ',
      genus: 'たねポケモン',
      generation_id: 1,
      pokedex_number: 1,
      types: ['grass', 'poison'],
      firstChar: 'フ',
      lastChar: 'ネ',
    },
  ];

  beforeEach(() => {
    mockDependencies = {
      gameStateModel: {
        getUsedPokemon: vi.fn().mockReturnValue(new Set()),
        getRemainingCount: vi.fn().mockReturnValue(100),
        markPokemonAsUsed: vi.fn(),
        reset: vi.fn(),
        getLastUsedPokemon: vi.fn().mockReturnValue(null),
        getWarnings: vi.fn().mockReturnValue([]),
      },
      pokemonModel: {
        getAllPokemon: vi.fn().mockReturnValue(testPokemon),
        getPokemonByName: vi
          .fn()
          .mockImplementation(
            (name: string) => testPokemon.find((p) => p.name === name) || null,
          ),
      },
      gameStatusView: {
        update: vi.fn(),
        on: vi.fn(),
      },
      usedPokemonView: {
        update: vi.fn(),
      },
      warningView: {
        update: vi.fn(),
      },
    };

    gameController = createGameController(mockDependencies);
  });

  describe('Pokemon Selection Validation', () => {
    it('should allow valid Pokemon selection', () => {
      const pokemon = testPokemon[0];

      const violations = gameController.validatePokemonSelection(pokemon);

      expect(violations).toHaveLength(0);
    });

    it('should reject already used Pokemon', () => {
      const pokemon = testPokemon[0];
      const usedPokemon = new Set([pokemon.name]);
      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );

      const violations = gameController.validatePokemonSelection(pokemon);

      expect(violations).toHaveLength(1);
      expect(violations[0].rule).toBe('unique_pokemon');
      expect(violations[0].message).toBe(
        'このポケモンはすでに使用されています',
      );
    });

    it('should reject Pokemon with wrong starting character', () => {
      // Set up a last used Pokemon that ends with "ウ"
      (
        mockDependencies.gameStateModel.getLastUsedPokemon as Mock
      ).mockReturnValue(testPokemon[0]); // ピカチュウ ends with "ウ"
      const pokemon = testPokemon[2]; // フシギダネ starts with "フ"

      const violations = gameController.validatePokemonSelection(pokemon);

      expect(violations).toHaveLength(1);
      expect(violations[0].rule).toBe('character_chain');
      expect(violations[0].message).toBe(
        '「ウ」から始まるポケモンを選んでください',
      );
    });
  });

  describe('Pokemon Usage', () => {
    it('should successfully use valid Pokemon', () => {
      const pokemon = testPokemon[0];

      const success = gameController.handlePokemonUse(pokemon);

      expect(success).toBe(true);
      expect(
        mockDependencies.gameStateModel.markPokemonAsUsed,
      ).toHaveBeenCalledWith(pokemon);
    });

    it('should reject invalid Pokemon and show warnings', () => {
      const pokemon = testPokemon[0];
      const usedPokemon = new Set([pokemon.name]);
      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );

      const success = gameController.handlePokemonUse(pokemon);

      expect(success).toBe(false);
      expect(
        mockDependencies.gameStateModel.markPokemonAsUsed,
      ).not.toHaveBeenCalled();
      expect(mockDependencies.warningView.update).toHaveBeenCalledWith({
        warnings: [
          {
            type: 'already_used',
            message: 'このポケモンはすでに使用されています',
            pokemon,
          },
        ],
      });
    });
  });

  describe('Game Warnings', () => {
    it('should generate warning for Pokemon ending with ン', () => {
      const pokemonEndingWithN: Pokemon = {
        name: 'ピジョン',
        genus: 'とりポケモン',
        generation_id: 1,
        pokedex_number: 17,
        types: ['normal', 'flying'],
        firstChar: 'ピ',
        lastChar: 'ン',
      };

      const warnings = gameController.generateGameWarnings(pokemonEndingWithN);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].type).toBe('ending_with_n');
      expect(warnings[0].message).toBe(
        '「ン」で終わるポケモンです。次のプレイヤーが困るかもしれません',
      );
    });

    it('should not generate warnings for normal Pokemon', () => {
      const pokemon = testPokemon[0];

      const warnings = gameController.generateGameWarnings(pokemon);

      expect(warnings).toHaveLength(0);
    });
  });

  describe('Game Reset', () => {
    it('should reset game state', () => {
      gameController.handleGameReset();

      expect(mockDependencies.gameStateModel.reset).toHaveBeenCalled();
    });

    it('should update all views after reset', () => {
      gameController.handleGameReset();

      expect(mockDependencies.gameStatusView.update).toHaveBeenCalled();
      expect(mockDependencies.usedPokemonView.update).toHaveBeenCalled();
      expect(mockDependencies.warningView.update).toHaveBeenCalled();
    });
  });

  describe('View Updates', () => {
    it('should update all views with current game state', () => {
      const usedPokemon = new Set(['ピカチュウ']);
      const lastUsed = testPokemon[0];

      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );
      (
        mockDependencies.gameStateModel.getLastUsedPokemon as Mock
      ).mockReturnValue(lastUsed);
      (
        mockDependencies.gameStateModel.getRemainingCount as Mock
      ).mockReturnValue(99);
      (mockDependencies.gameStateModel.getWarnings as Mock).mockReturnValue([]);

      gameController.updateAllViews();

      expect(mockDependencies.gameStatusView.update).toHaveBeenCalledWith({
        lastUsed,
        currentChar: 'ウ', // Calculated from lastUsed.lastChar
        remainingCount: 99,
        isGameOver: false, // Calculated from warnings
      });

      expect(mockDependencies.usedPokemonView.update).toHaveBeenCalledWith({
        usedPokemon: [testPokemon[0]],
      });

      expect(mockDependencies.warningView.update).toHaveBeenCalledWith({
        warnings: [],
      });
    });
  });

  describe('Initialization', () => {
    it('should set up event listeners on initialization', async () => {
      await gameController.initialize();

      expect(mockDependencies.gameStatusView.on).toHaveBeenCalledWith(
        'game:restart',
        expect.any(Function),
      );
    });

    it('should initialize views on startup', async () => {
      await gameController.initialize();

      expect(mockDependencies.gameStatusView.update).toHaveBeenCalled();
      expect(mockDependencies.usedPokemonView.update).toHaveBeenCalled();
      expect(mockDependencies.warningView.update).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle model errors gracefully', () => {
      (
        mockDependencies.gameStateModel.markPokemonAsUsed as Mock
      ).mockImplementation(() => {
        throw new Error('Model error');
      });

      expect(() => {
        gameController.handlePokemonUse(testPokemon[0]);
      }).not.toThrow();
    });
  });
});
