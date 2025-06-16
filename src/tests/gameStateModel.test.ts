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



  describe('reset', () => {
    it('should clear all state', () => {
      gameStateModel.markPokemonAsUsed(testPokemon[0]);
      gameStateModel.reset();

      expect(gameStateModel.getUsedPokemon().size).toBe(0);
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

  });
});
