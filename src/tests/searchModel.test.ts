import { beforeEach, describe, expect, it } from 'vitest';
import { createPokemonModel } from '../models/pokemonModel';
import { createSearchModel } from '../models/searchModel';
import type { Pokemon, PokemonType } from '../types';

describe('SearchModel', () => {
  // Test data and dependencies
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
    {
      name: 'ピジョン',
      genus: 'とりポケモン',
      generation_id: 1,
      pokedex_number: 17,
      types: ['normal', 'flying'] as PokemonType[],
      firstChar: 'ぴ',
      lastChar: 'ん',
    },
  ];

  let pokemonModel: ReturnType<typeof createPokemonModel>;
  let searchModel: ReturnType<typeof createSearchModel>;

  beforeEach(() => {
    // Create fresh model instances for each test to avoid memory accumulation
    pokemonModel = createPokemonModel();

    // Add only the test data
    for (const pokemon of testPokemon) {
      pokemonModel.addPokemon(pokemon);
    }

    searchModel = createSearchModel(pokemonModel);
  });

  describe('search', () => {
    it('should find Pokemon by first character', () => {
      const results = searchModel.search('ぴ');
      expect(results).toHaveLength(2);
      expect(results.map((p) => p.name)).toContain('ピカチュウ');
      expect(results.map((p) => p.name)).toContain('ピジョン');
    });

    it('should return all Pokemon when query is empty', () => {
      const results = searchModel.search('');
      expect(results).toHaveLength(3);
    });

    it('should handle no matches', () => {
      const results = searchModel.search('め');
      expect(results).toHaveLength(0);
    });
  });

  describe('getCachedResults', () => {
    it('should return last search results', () => {
      searchModel.search('ぴ');
      const cached = searchModel.getCachedResults();
      expect(cached).toHaveLength(2);
      expect(cached.map((p) => p.name)).toContain('ピカチュウ');
      expect(cached.map((p) => p.name)).toContain('ピジョン');
    });

    it('should return all Pokemon initially', () => {
      const cached = searchModel.getCachedResults();
      expect(cached).toHaveLength(3);
    });
  });

  describe('clearCache', () => {
    it('should reset to showing all Pokemon', () => {
      searchModel.search('ぴ');
      expect(searchModel.getCachedResults()).toHaveLength(2);

      searchModel.clearCache();
      expect(searchModel.getCachedResults()).toHaveLength(3);
    });
  });

  describe('events', () => {
    it('should emit state:updated when search results change', () => {
      let eventEmitted = false;
      searchModel.on('state:updated', () => {
        eventEmitted = true;
      });

      searchModel.search('ぴ');
      expect(eventEmitted).toBe(true);
    });

    it('should emit state:updated when cache is cleared', () => {
      let eventEmitted = false;
      searchModel.on('state:updated', () => {
        eventEmitted = true;
      });

      searchModel.clearCache();
      expect(eventEmitted).toBe(true);
    });
  });

  describe('search optimization', () => {
    it('should use cached results for repeat searches', () => {
      const initialResults = searchModel.search('ぴ');
      const cachedResults = searchModel.search('ぴ');

      expect(initialResults).toBe(cachedResults); // Should be same reference
    });

    it('should update cache when new Pokemon is added', () => {
      searchModel.search('ぴ');
      expect(searchModel.getCachedResults()).toHaveLength(2);

      const newPokemon: Pokemon = {
        name: 'ピッピ',
        genus: 'ようせいポケモン',
        generation_id: 1,
        pokedex_number: 35,
        types: ['fairy'] as PokemonType[],
        firstChar: 'ぴ',
        lastChar: 'ぴ',
      };

      pokemonModel.addPokemon(newPokemon);
      searchModel.search('ぴ');
      expect(searchModel.getCachedResults()).toHaveLength(3);
    });
  });
});
