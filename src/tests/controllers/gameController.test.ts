import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type GameControllerDependencies,
  createGameController,
} from '../../controllers/gameController.js';
import type { PokemonObject } from '../../types/index.js';

describe('GameController', () => {
  let gameController: ReturnType<typeof createGameController>;
  let mockDependencies: GameControllerDependencies;

  const testPokemon: PokemonObject[] = [
    {
      name: 'ピカチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 25,
      types: [4], // electric
      firstChar: 'ピ',
      lastChar: 'ウ',
    },
    {
      name: 'ウインディ',
      genus: 'でんせつポケモン',
      generation_id: 1,
      pokedex_number: 59,
      types: [2], // fire
      firstChar: 'ウ',
      lastChar: 'ィ',
    },
    {
      name: 'フシギダネ',
      genus: 'たねポケモン',
      generation_id: 1,
      pokedex_number: 1,
      types: [5, 8], // grass, poison
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
      },
      usedPokemonView: {
        update: vi.fn(),
      },
    };

    gameController = createGameController(mockDependencies);
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
    });
  });

  describe('View Updates', () => {
    it('should update all views with current game state', () => {
      const usedPokemon = new Set(['ピカチュウ']);

      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );
      (
        mockDependencies.gameStateModel.getRemainingCount as Mock
      ).mockReturnValue(99);

      gameController.updateAllViews();

      expect(mockDependencies.gameStatusView.update).toHaveBeenCalledWith({
        remainingCount: 99,
      });

      expect(mockDependencies.usedPokemonView.update).toHaveBeenCalledWith({
        usedPokemon: [testPokemon[0]],
      });
    });
  });

  describe('Initialization', () => {
    it('should initialize views on startup', async () => {
      await gameController.initialize();

      expect(mockDependencies.gameStatusView.update).toHaveBeenCalled();
      expect(mockDependencies.usedPokemonView.update).toHaveBeenCalled();
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
