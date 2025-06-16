import { beforeEach, describe, expect, it } from 'vitest';
import { createGameStateModel } from '../models/gameStateModel';
import { createPokemonModel } from '../models/pokemonModel';
import type { PokemonObject } from '../types';

describe('GameStateModel', () => {
  // Test data and dependencies
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
      name: 'ウツドン',
      genus: 'ハエとりポケモン',
      generation_id: 1,
      pokedex_number: 71,
      types: [5, 8], // grass, poison
      firstChar: 'ウ',
      lastChar: 'ン',
    },
  ];

  const pokemonModel = createPokemonModel();
  const gameStateModel = createGameStateModel(pokemonModel);

  beforeEach(() => {
    // Add test Pokemon to the model
    for (const pokemon of testPokemon) {
      pokemonModel.addPokemon(pokemon);
    }
    // Reset state
    gameStateModel.reset();
  });

  describe('getUsedPokemon', () => {
    it('should return empty set initially', () => {
      expect(gameStateModel.getUsedPokemon().size).toBe(0);
    });

    it('should return used Pokemon names', () => {
      gameStateModel.markPokemonAsUsed(testPokemon[0]);
      expect(gameStateModel.getUsedPokemon().has('ピカチュウ')).toBe(true);
      expect(gameStateModel.getUsedPokemon().size).toBe(1);
    });
  });

  describe('getRemainingCount', () => {
    it('should return total count initially', () => {
      expect(gameStateModel.getRemainingCount()).toBe(
        pokemonModel.getAllPokemon().length,
      );
    });

    it('should decrease after using Pokemon', () => {
      const initialCount = gameStateModel.getRemainingCount();
      gameStateModel.markPokemonAsUsed(testPokemon[0]);
      expect(gameStateModel.getRemainingCount()).toBe(initialCount - 1);
    });
  });

  describe('getWarnings', () => {
    it('should warn about Pokemon ending with ん', () => {
      gameStateModel.markPokemonAsUsed(testPokemon[0]); // Use ピカチュウ first

      const warnings = gameStateModel.getWarnings();
      const nEndingWarning = warnings.find((w) => w.type === 'ending_with_n');

      expect(nEndingWarning).toBeDefined();
      if (nEndingWarning?.pokemon) {
        expect(nEndingWarning.pokemon.name).toBe('ウツドン');
      } else {
        throw new Error('Expected warning to have Pokemon reference');
      }
    });
  });

  describe('getLastUsedPokemon', () => {
    it('should be null initially', () => {
      expect(gameStateModel.getLastUsedPokemon()).toBeNull();
    });

    it('should return last used Pokemon', () => {
      gameStateModel.markPokemonAsUsed(testPokemon[0]);
      const lastUsed = gameStateModel.getLastUsedPokemon();
      expect(lastUsed).not.toBeNull();
      expect(lastUsed?.name).toBe('ピカチュウ');
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      gameStateModel.markPokemonAsUsed(testPokemon[0]);
      gameStateModel.reset();

      expect(gameStateModel.getUsedPokemon().size).toBe(0);
      expect(gameStateModel.getLastUsedPokemon()).toBeNull();
      expect(gameStateModel.getRemainingCount()).toBe(
        pokemonModel.getAllPokemon().length,
      );
    });

    it('should emit state:updated event', () => {
      let eventEmitted = false;
      gameStateModel.on('state:updated', () => {
        eventEmitted = true;
      });

      gameStateModel.reset();
      expect(eventEmitted).toBe(true);
    });
  });

  describe('state updates', () => {
    it('should emit state:updated when Pokemon is used', () => {
      let eventEmitted = false;
      gameStateModel.on('state:updated', () => {
        eventEmitted = true;
      });

      gameStateModel.markPokemonAsUsed(testPokemon[0]);
      expect(eventEmitted).toBe(true);
    });

    it('should update lastUsedPokemon when Pokemon is used', () => {
      gameStateModel.markPokemonAsUsed(testPokemon[0]);
      expect(gameStateModel.getLastUsedPokemon()?.name).toBe('ピカチュウ');

      gameStateModel.markPokemonAsUsed(testPokemon[1]);
      expect(gameStateModel.getLastUsedPokemon()?.name).toBe('ウツドン');
    });
  });
});
