import { beforeEach, describe, expect, it } from 'vitest';
import { createPokemonModel } from '../models/pokemonModel';
import type { PokemonObject } from '../types';

describe('PokemonModel', () => {
  // Test data
  const testPokemon: PokemonObject[] = [
    {
      name: 'ピカチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 25,
      types: [4], // electric
      firstChar: 'ぴ',
      lastChar: 'う',
    },
    {
      name: 'ライチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 26,
      types: [4], // electric
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
      const pikachu = pokemonModel.searchByFirstChar('ピ');
      expect(pikachu).toHaveLength(1);
      expect(pikachu[0].name).toBe('ピカチュウ');

      const raichu = pokemonModel.searchByFirstChar('ラ');
      expect(raichu).toHaveLength(1);
      expect(raichu[0].name).toBe('ライチュウ');
    });

    it('should return empty array for non-matching character', () => {
      const result = pokemonModel.searchByFirstChar('ア');
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
      const newPokemon: PokemonObject = {
        name: 'フシギダネ',
        genus: 'たねポケモン',
        generation_id: 1,
        pokedex_number: 1,
        types: [5, 8], // grass, poison
        firstChar: 'ふ',
        lastChar: 'ね',
      };

      pokemonModel.addPokemon(newPokemon);

      const addedPokemon = pokemonModel.getPokemonByName('フシギダネ');
      expect(addedPokemon).not.toBeNull();
      expect(addedPokemon?.name).toBe('フシギダネ');

      const searchResult = pokemonModel.searchByFirstChar('フ');
      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].name).toBe('フシギダネ');
    });

    it('should emit state:updated event', () => {
      let eventEmitted = false;
      pokemonModel.on('state:updated', () => {
        eventEmitted = true;
      });

      const newPokemon: PokemonObject = {
        name: 'ゼニガメ',
        genus: 'かめのこポケモン',
        generation_id: 1,
        pokedex_number: 7,
        types: [3], // water
        firstChar: 'ぜ',
        lastChar: 'め',
      };

      pokemonModel.addPokemon(newPokemon);
      expect(eventEmitted).toBe(true);
    });
  });

  describe('type name conversion', () => {
    it('should convert numeric type IDs to type names', () => {
      expect(pokemonModel.getTypeName(1)).toBe('normal');
      expect(pokemonModel.getTypeName(4)).toBe('electric');
      expect(pokemonModel.getTypeName(5)).toBe('grass');
    });
  });
});
