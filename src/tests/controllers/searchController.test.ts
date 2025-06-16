import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type SearchControllerDependencies,
  createSearchController,
} from '../../controllers/searchController.js';
import type { PokemonObject } from '../../types/index.js';

describe('SearchController', () => {
  let searchController: ReturnType<typeof createSearchController>;
  let mockDependencies: SearchControllerDependencies;

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
  ];

  beforeEach(() => {
    mockDependencies = {
      searchModel: {
        search: vi.fn().mockReturnValue(testPokemon),
        getCachedResults: vi.fn().mockReturnValue(testPokemon),
        clearCache: vi.fn(),
      },
      gameStateModel: {
        getUsedPokemon: vi.fn().mockReturnValue(new Set()),
        markPokemonAsUsed: vi.fn(),
      },
      pokemonModel: {
        getPokemonByName: vi
          .fn()
          .mockImplementation(
            (name: string) => testPokemon.find((p) => p.name === name) || null,
          ),
      },
      searchView: {
        on: vi.fn(),
        update: vi.fn(),
      },
      listView: {
        on: vi.fn(),
        update: vi.fn(),
      },
    };

    searchController = createSearchController(mockDependencies);
  });

  describe('Character Selection', () => {
    it('should handle character selection', () => {
      const char = 'ピ';

      searchController.handleCharacterSelect(char);

      // Should search with katakana character (database uses katakana keys)
      expect(mockDependencies.searchModel.search).toHaveBeenCalledWith('ピ');
      expect(mockDependencies.searchView.update).toHaveBeenCalledWith({
        openCharacter: char, // But display original katakana character
        openRowIndex: 10, // ピ belongs to パ行 (Pa-row) which is at index 10
        pokemonData: { [char]: testPokemon },
        usedPokemon: [],
        errorMessage: undefined,
      });
    });

    it('should include used Pokemon in the usedPokemon array', () => {
      const usedPokemon = new Set(['ピカチュウ']);
      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );

      searchController.handleCharacterSelect('ピ');

      const updateCall = (mockDependencies.searchView.update as Mock).mock
        .calls[0][0];
      expect(updateCall.usedPokemon).toHaveLength(1);
      expect(updateCall.usedPokemon[0].name).toBe('ピカチュウ');
    });
  });

  describe('Pokemon Selection', () => {
    it('should handle valid Pokemon selection', () => {
      const pokemon = testPokemon[0];

      searchController.handlePokemonSelect(pokemon);

      expect(
        mockDependencies.gameStateModel.markPokemonAsUsed,
      ).toHaveBeenCalledWith(pokemon);
      expect(mockDependencies.searchView.update).toHaveBeenCalledWith({
        openCharacter: undefined,
        openRowIndex: undefined,
        pokemonData: {},
        usedPokemon: [],
        errorMessage: undefined,
      });
    });

    it('should reject already used Pokemon', () => {
      const pokemon = testPokemon[0];
      const usedPokemon = new Set([pokemon.name]);
      (mockDependencies.gameStateModel.getUsedPokemon as Mock).mockReturnValue(
        usedPokemon,
      );

      searchController.handlePokemonSelect(pokemon);

      expect(
        mockDependencies.gameStateModel.markPokemonAsUsed,
      ).not.toHaveBeenCalled();
      expect(mockDependencies.searchView.update).toHaveBeenCalledWith({
        errorMessage: 'このポケモンはすでに使用されています',
      });
    });
  });

  describe('Search Clear', () => {
    it('should handle search clear', async () => {
      await searchController.initialize();

      // Find and call the search:clear event handler
      const clearHandler = (
        mockDependencies.searchView.on as Mock
      ).mock.calls.find((call: unknown[]) => call[0] === 'search:clear')?.[1];

      if (clearHandler) {
        clearHandler();
        expect(mockDependencies.searchModel.clearCache).toHaveBeenCalled();
        expect(mockDependencies.searchView.update).toHaveBeenCalledWith({
          openCharacter: undefined,
          openRowIndex: undefined,
          pokemonData: {},
          usedPokemon: [],
          isLoading: false,
          errorMessage: undefined,
        });
      } else {
        throw new Error('Search clear handler not found');
      }
    });
  });

  describe('Initialization', () => {
    it('should set up event listeners on initialization', async () => {
      await searchController.initialize();

      expect(mockDependencies.searchView.on).toHaveBeenCalledWith(
        'search:character-select',
        expect.any(Function),
      );
      expect(mockDependencies.searchView.on).toHaveBeenCalledWith(
        'search:pokemon-select',
        expect.any(Function),
      );
      expect(mockDependencies.searchView.on).toHaveBeenCalledWith(
        'search:clear',
        expect.any(Function),
      );
    });

    it('should clear state on initialization', async () => {
      await searchController.initialize();

      expect(mockDependencies.searchModel.clearCache).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      (mockDependencies.searchModel.search as Mock).mockImplementation(() => {
        throw new Error('Search failed');
      });

      expect(() => {
        searchController.handleCharacterSelect('test');
      }).not.toThrow();
    });
  });
});
