import { beforeEach, describe, expect, it } from 'vitest';
import { createPokemonModel } from '../models/pokemonModel';
import type { Pokemon, PokemonType } from '../types';

describe('PokemonModel', () => {
  // Test data
  const testPokemon: Pokemon[] = [
    {
      name: 'ピカチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 25,
      types: ['electric'] as PokemonType[],
      firstChar: 'ぴ',
      lastChar: 'う',
    },
    {
      name: 'ライチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 26,
      types: ['electric'] as PokemonType[],
      firstChar: 'ら',
      lastChar: 'う',
    },
  ];

  let pokemonModel: ReturnType<typeof createPokemonModel>;

  beforeEach(() => {
    // Create a fresh model instance for each test to avoid memory accumulation
    pokemonModel = createPokemonModel();

    // Add only the test data
    for (const pokemon of testPokemon) {
      pokemonModel.addPokemon(pokemon);
    }
  });

  describe('getAllPokemon', () => {
    it('should return all Pokemon', () => {
      const allPokemon = pokemonModel.getAllPokemon();
      expect(allPokemon).toHaveLength(2);
      expect(allPokemon[0].name).toBe('ピカチュウ');
      expect(allPokemon[1].name).toBe('ライチュウ');
    });
  });

  describe('searchByFirstChar', () => {
    it('should return Pokemon starting with the given character', () => {
      const pikachu = pokemonModel.searchByFirstChar('ぴ');
      expect(pikachu).toHaveLength(1);
      expect(pikachu[0].name).toBe('ピカチュウ');

      const raichu = pokemonModel.searchByFirstChar('ら');
      expect(raichu).toHaveLength(1);
      expect(raichu[0].name).toBe('ライチュウ');
    });

    it('should return empty array for non-matching character', () => {
      const result = pokemonModel.searchByFirstChar('あ');
      expect(result).toHaveLength(0);
    });
  });

  describe('getPokemonByName', () => {
    it('should return Pokemon by exact name match', () => {
      const pikachu = pokemonModel.getPokemonByName('ピカチュウ');
      expect(pikachu).not.toBeNull();
      expect(pikachu?.name).toBe('ピカチュウ');
    });

    it('should return null for non-existing Pokemon', () => {
      const result = pokemonModel.getPokemonByName('ないポケモン');
      expect(result).toBeNull();
    });
  });

  describe('addPokemon', () => {
    it('should add Pokemon and update search indices', () => {
      const newPokemon: Pokemon = {
        name: 'フシギダネ',
        genus: 'たねポケモン',
        generation_id: 1,
        pokedex_number: 1,
        types: ['grass', 'poison'] as PokemonType[],
        firstChar: 'ふ',
        lastChar: 'ね',
      };

      pokemonModel.addPokemon(newPokemon);

      const addedPokemon = pokemonModel.getPokemonByName('フシギダネ');
      expect(addedPokemon).not.toBeNull();
      expect(addedPokemon?.name).toBe('フシギダネ');

      const searchResult = pokemonModel.searchByFirstChar('ふ');
      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].name).toBe('フシギダネ');
    });

    it('should emit state:updated event', () => {
      let eventEmitted = false;
      pokemonModel.on('state:updated', () => {
        eventEmitted = true;
      });

      const newPokemon: Pokemon = {
        name: 'ゼニガメ',
        genus: 'かめのこポケモン',
        generation_id: 1,
        pokedex_number: 7,
        types: ['water'] as PokemonType[],
        firstChar: 'ぜ',
        lastChar: 'め',
      };

      pokemonModel.addPokemon(newPokemon);
      expect(eventEmitted).toBe(true);
    });
  });

  describe('validation', () => {
    it('should filter out invalid Pokemon types', () => {
      const invalidPokemon = {
        name: 'テストポケモン',
        genus: 'テストポケモン',
        generation_id: 1,
        pokedex_number: 999,
        types: ['invalid-type'] as unknown as PokemonType[],
        firstChar: 'て',
        lastChar: 'ん',
      };

      pokemonModel.addPokemon(invalidPokemon);
      const addedPokemon = pokemonModel.getPokemonByName('テストポケモン');
      expect(addedPokemon).not.toBeNull();
      expect(addedPokemon?.types).toEqual([]); // Invalid types should be filtered out
    });
  });
});
